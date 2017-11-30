from radviz import Radviz
import  numpy as np
from collections import OrderedDict
import json
from sklearn import linear_model
from domain_discovery_API.online_classifier.tfidf_vector import tfidf_vectorizer
from domain_discovery_API.models.domain_discovery_model import DomainModel
from domain_discovery_API.elastic.config import es, es_doc_type, es_server
from fetch_data import fetch_data

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.datasets import fetch_20newsgroups
from numpy.linalg import norm
from sklearn.manifold import TSNE

import numpy as np
from sklearn.cluster import KMeans
import random
from scipy.sparse import csr_matrix, lil_matrix
from functools import reduce
#import urllib2
#from bs4 import BeautifulSoup

class RadvizModel(DomainModel):
    radviz = None

    def __init__(self, path):
        self._path = path
        super(RadvizModel, self).__init__(path)

    def _esInfo(self, domainId):
        es_info = {
          "activeDomainIndex": self._domains[domainId]['index'],
          "docType": self._domains[domainId]['doc_type']
        }
        if not self._domains[domainId].get("mapping") is None:
          es_info["mapping"] = self._domains[domainId]["mapping"]
        else:
          es_info["mapping"] = self._mapping
        return es_info

    def clusterIndicesNumpy(self, clustNum, labels_array): #numpy
        return np.where(labels_array == clustNum)[0]

    def Kmeans(self, data, nro_cluster ):
        random_state = 170
        vectorizer = TfidfVectorizer(max_features=2000)
        vectors = vectorizer.fit_transform(data)
        #convert sparce matrix to dense matrix
        sparceMatrix = vectors
        X_norm = (sparceMatrix - sparceMatrix.min())/(sparceMatrix.max() - sparceMatrix.min())
        denseMatrix = X_norm.todense()
        X = denseMatrix
        yPredKmeans = KMeans(n_clusters=nro_cluster, random_state=random_state).fit_predict(X) #Kmeans
        return yPredKmeans


    def getRandomSample_inCluster(self, nro_cluster, y_Pred, raw_data, labels):
        y_clusterData = range(nro_cluster)
        clusters = []
        labels_cluster =[]
        X_sum = []
        temp_data = []
        max_features = 200
        for i in range(nro_cluster):
            cluster = []
            idsData_cluster = self.clusterIndicesNumpy(i,y_Pred)
            for j in idsData_cluster:
                cluster.append( raw_data[j] )
            clusters.append(cluster)
            random_id = random.randint(0,len(idsData_cluster)-1)
            temp_data.append(raw_data[idsData_cluster[3]]) #3
            labels_cluster.append(labels[idsData_cluster[3]]) #3

            tf_v = tfidf_vectorizer(convert_to_ascii=True, max_features=max_features)
            [X, features] = tf_v.vectorize(clusters[i])
            temp = np.squeeze(np.asarray(np.sum(X.todense(), axis=0)))
            X_sum.append(np.ceil(temp))
        return [temp_data,labels_cluster, X_sum]

    def getClusterInfo(self, nro_cluster, y_Pred, raw_data, labels, max_features):
        y_clusterData = range(nro_cluster)
        clusters_RawData = []
        label_by_clusters =[]
        original_labels=[]
        X_sum = []
        subset_raw_data = []
        features_in_clusters =[]
        clusters_TFData = []
        for i in range(nro_cluster):
            cluster = []
            idsData_cluster = self.clusterIndicesNumpy(i,y_Pred)
            for j in idsData_cluster:
                cluster.append( raw_data[j] )
                original_labels.append(labels[j])
            clusters_RawData.append(cluster)
            random_id = random.randint(0,len(idsData_cluster)-1)
            subset_raw_data.append(raw_data[idsData_cluster[3]]) #3
            #label_by_clusters.append(labels[idsData_cluster[3]]) #3
            label_by_clusters.append(i) #3

            tf_v = tfidf_vectorizer(convert_to_ascii=True, max_features=max_features)
            [X, features] = tf_v.vectorize(clusters_RawData[i])
            clusters_TFData.append(X.todense())
            features_in_clusters.append(features)
            temp = np.squeeze(np.asarray(np.sum(X.todense(), axis=0)))
            X_sum.append(np.ceil(temp))
        return [features_in_clusters, clusters_RawData, label_by_clusters, original_labels, clusters_TFData, X_sum, subset_raw_data ]
        #features_in_clusters : list of features for each cluster.
        #clusters_RawData : array of arrays. [[raw_data_for_cluster1][raw_data_for_cluster2][raw_data_for_cluster3] ...]
        #label_by_clusters : label for each cluster.
        #clusters_TFData : array of arrays. [[raw_data_for_cluster1][raw_data_for_cluster2][raw_data_for_cluster3] ...]
        #X_sum : the clusters_TFData (tf vectors) of each cluster was reduced to just one vector (the columns were summed). At the end only one vector is generated for each cluster.
        #subset_raw_data: sub dataset (raw data) from each cluster. A random sample was took from each cluster.

    def getMedoidSamples_inCluster(self,nro_cluster, y_Pred, raw_data, labels, max_features_in_cluster):

        max_features = max_features_in_cluster
        [features_in_clusters, clusters_RawData, label_by_clusters, original_labels, clusters_TFData, X_sum, subset_raw_data ] = self.getClusterInfo(nro_cluster, y_Pred, raw_data, labels, max_features)

        features_uniques = np.unique(features_in_clusters).tolist()
        cluster_labels = []
        new_X_sum = []
        for i in range(nro_cluster):
            new_X = np.zeros(len(features_uniques))
            for j in range(len(features_in_clusters[i])): #loop over the cluster's features
                try:
                    index_feat = features_uniques.index(features_in_clusters[i][j])
                    new_X[index_feat]=X_sum[i][j]
                except ValueError:
                    print "error"
            new_X_sum.append(np.asarray(new_X))
            cluster_labels.append(label_by_clusters[i])
        return [subset_raw_data,cluster_labels, new_X_sum, features_uniques]

    def getMedoidSamples_inCluster_NumData(self,features_in_clusters, features_uniques, label_by_clusters, X_sum ):

        features_uniques = np.unique(features_uniques).tolist()
        cluster_labels = []
        new_X_sum = []
        for i in range(nro_cluster):
            new_X = np.zeros(len(features_uniques))
            for j in range(len(features_in_clusters[i])): #loop over the cluster's features
                try:
                    index_feat = features_uniques.index(features_in_clusters[i][j])
                    new_X[index_feat]=X_sum[i][j]
                except ValueError:
                    print "error"
            new_X_sum.append(np.asarray(new_X))
            cluster_labels.append(label_by_clusters[i])
        return [cluster_labels, new_X_sum]

    def getVectors_for_allSamples(self, nro_cluster, clusters_TFData, features_uniques, features_in_clusters, label_by_clusters,original_labels, subset_raw_data):
        new_X_sum = []
        cluster_labels = []
        for i in range(nro_cluster):
            X_from_cluster = clusters_TFData[i]
            for k in range(len(clusters_TFData[i])):
                new_X = np.zeros(len(features_uniques))
                tempList = np.squeeze(np.asarray(X_from_cluster[k]))
                for j in range(len(features_in_clusters[i])): #loop over the cluster's features
                    try:
                        index_feat = features_uniques.index(features_in_clusters[i][j])
                        new_X[index_feat]=tempList[j]
                    except ValueError:
                        print "error"
                new_X_sum.append(np.asarray(new_X))
                cluster_labels.append(label_by_clusters[i])
        return [subset_raw_data, cluster_labels, original_labels, new_X_sum, features_uniques]

    def getAllSamples_inCluster(self, nro_cluster, y_Pred, raw_data, labels, max_features_in_cluster):
        max_features = max_features_in_cluster
        [features_in_clusters, clusters_RawData, label_by_clusters, original_labels, clusters_TFData, X_sum, subset_raw_data ] = self.getClusterInfo(nro_cluster, y_Pred, raw_data, labels, max_features)

        features_uniques = np.unique(features_in_clusters).tolist()

        return self.getVectors_for_allSamples(nro_cluster, clusters_TFData, features_uniques, features_in_clusters, label_by_clusters,original_labels, subset_raw_data)

    def getAllSamples_inCluster_RemoveCommonFeatures(self, nro_cluster, y_Pred, raw_data, labels, max_features_in_cluster):
        max_features = max_features_in_cluster
        [features_in_clusters, clusters_RawData, label_by_clusters, original_labels, clusters_TFData, X_sum, subset_raw_data ] = self.getClusterInfo(nro_cluster, y_Pred, raw_data, labels, max_features)

        intersection = reduce(np.intersect1d, (features_in_clusters)).tolist() #getting common keywords between all clusters
        features_uniques_temp = np.unique(features_in_clusters).tolist()
        features_uniques = np.setdiff1d(features_uniques_temp,intersection).tolist()#removing common keywords between all clusters

        return self.getVectors_for_allSamples(nro_cluster, clusters_TFData, features_uniques, features_in_clusters, label_by_clusters,original_labels, subset_raw_data)

    def getAllSamples_inCluster_RemoveCommonFeatures_medoids(self, nro_cluster, y_Pred, raw_data, labels, max_features_in_cluster):
        max_features = max_features_in_cluster
        [features_in_clusters, clusters_RawData, label_by_clusters, original_labels, clusters_TFData, X_sum, subset_raw_data ] = self.getClusterInfo(nro_cluster, y_Pred, raw_data, labels, max_features)

        intersection = reduce(np.intersect1d, (features_in_clusters)).tolist() #getting common keywords between all clusters
        features_uniques_temp = np.unique(features_in_clusters).tolist()
        features_uniques = np.setdiff1d(features_uniques_temp,intersection).tolist()#removing common keywords between all clusters

        [labels_medoid_cluster, X_medoid_Cluster] = self.getMedoidSamples_inCluster_NumData(features_in_clusters, features_uniques, label_by_clusters, X_sum )
        [subset_raw_data, cluster_labels, original_labels, new_X_sum, features_uniques] =  self.getVectors_for_allSamples(nro_cluster, clusters_TFData, features_uniques, features_in_clusters, label_by_clusters,original_labels, subset_raw_data)
        return [subset_raw_data, cluster_labels, original_labels, new_X_sum, features_uniques,    labels_medoid_cluster, X_medoid_Cluster]

    def getRadvizPoints(self, session, filterByTerm, typeRadViz, nroCluster):
        es_info = self._esInfo(session['domainId'])
        index = es_info['activeDomainIndex']
        max_features = 200
        ddteval_data = fetch_data(index, filterByTerm, es_doc_type=es_doc_type, es=es)

        categories = ['sci.crypt', 'rec.sport.hockey', 'comp.os.ms-windows.misc','talk.politics.mideast']
        newsgroups_train = fetch_20newsgroups(subset='train', categories=categories)

        #data = ddteval_data["data"]
        data = newsgroups_train.data
        X = []
        features = []
        #print data
        stringLabels = np.array(map(str, np.array(newsgroups_train.target)))

        stringArray = [w.replace('0', 'comp.os.ms-windows.misc') for w in stringLabels]
        stringArray = [w.replace('1', 'rec.sport.hockey') for w in stringArray]
        stringArray = [w.replace('2', 'sci.crypt') for w in stringArray]
        stringArray = [w.replace('3', 'talk.politics.mideast') for w in stringArray]
        labels = stringArray
        #labels = ddteval_data["labels"]
        #urls = ddteval_data["urls"]
        nro_cluster = int(nroCluster)
        max_anchors = 240
        max_features_in_cluster=int(np.ceil(max_anchors/nro_cluster))
        yPredKmeans = self.Kmeans(data, nro_cluster )
        print typeRadViz
        if typeRadViz == "1":
            tf_v = tfidf_vectorizer(convert_to_ascii=True, max_features=max_features)
            [X_, features_] = tf_v.vectorize(data)
            X = X_
            features = features_
            cluster_labels = labels
            stringArray = labels
        elif typeRadViz == "2":
            #[clusterData, labels_cluster, X_sum] = self.getRandomSample_inCluster( nro_cluster, yPredKmeans, data, labels)
            [clusterData,  cluster_labels, original_labels, X_sum, features_uniques] = self.getAllSamples_inCluster( nro_cluster, yPredKmeans, data, labels,  max_features_in_cluster)
            stringArray = original_labels
            data = clusterData
            features = features_uniques
            X = csr_matrix(X_sum)
        elif typeRadViz == "3":
            [clusterData,  cluster_labels, original_labels, X_sum, features_uniques] = self.getAllSamples_inCluster_RemoveCommonFeatures( nro_cluster, yPredKmeans, data, labels, max_features_in_cluster)
            stringArray = original_labels
            data = clusterData
            features = features_uniques
            X = csr_matrix(X_sum)
        elif typeRadViz == "4":
            [clusterData,  cluster_labels, original_labels, X_sum, features_uniques] = self.getAllSamples_inCluster_RemoveCommonFeatures( nro_cluster, yPredKmeans, data, labels, max_features_in_cluster)
            stringArray = original_labels
            data = clusterData
            features = features_uniques
            X = csr_matrix(X_sum)
        elif typeRadViz == "5":
            [clusterData,  cluster_labels, original_labels, X_sum, features_uniques] = self.getAllSamples_inCluster_RemoveCommonFeatures( nro_cluster, yPredKmeans, data, labels, max_features_in_cluster)
            stringArray = original_labels
            data = clusterData
            features = features_uniques
            X = csr_matrix(X_sum)

        else:
            print "Nothing to do"

        matrix_transpose = np.transpose(X.todense())

        print "\n\n Number of 1-gram features = ", len(features)
        print "\n\n tf 1-gram matrix size = ", np.shape(X)
        # data = self.radviz.loadData_pkl("data/ht_data_200.pkl").todense()

        # data = np.transpose(data)

        # features = self.radviz.loadFeatures("data/ht_data_features_200.csv")
        # print features
        # print len(features)
        # labels = self.radviz.loadLabels("data/ht_data_labels_200.csv")
        # urls = self.radviz.loadSampleNames("data/ht_data_urls_200.csv")

        #titles = ddteval_data["title"]
        #snippets = ddteval_data["snippet"]
        #image_urls = ddteval_data["image_url"]

        urls = np.asarray(range(len(stringArray))).astype(str).tolist() #generating ids
        labels = stringArray
        titles = stringArray
        snippets = stringArray
        image_urls = stringArray


        self.radviz = Radviz(X, features, labels, urls)

        return_obj = {}
        for i in range(0, len(features)):
            return_obj[features[i]] = matrix_transpose[i,:].tolist()[0]
        #labels_urls = OrderedDict([("labels",labels), ("urls",urls), ("title", ddteval_data["title"]),("snippet",ddteval_data["snippet"]),("image_url",ddteval_data["image_url"])])
        labels_urls = OrderedDict([("labels",labels), ("urls",urls), ("title", titles),("snippet",snippets),("image_url",image_urls), ("pred_labels",cluster_labels)])
        od = OrderedDict(list(OrderedDict(sorted(return_obj.items())).items()) + list(labels_urls.items()))

        return od

    def computeTSP(self):
        return self.radviz.compute_tsp()
