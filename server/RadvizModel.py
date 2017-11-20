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

    

    def getRadvizPoints(self, session, filterByTerm):
        es_info = self._esInfo(session['domainId'])
        index = es_info['activeDomainIndex']
        max_features = 200
        ddteval_data = fetch_data(index, filterByTerm, es_doc_type=es_doc_type, es=es)

        categories = ['sci.crypt', 'rec.sport.hockey', 'comp.os.ms-windows.misc','talk.politics.mideast']
        newsgroups_train = fetch_20newsgroups(subset='train', categories=categories)

        #data = ddteval_data["data"]
        data = newsgroups_train.data
        #print data
        stringLabels = map(str, newsgroups_train.target)
        stringArray = [w.replace('0', 'comp.os.ms-windows.misc') for w in stringLabels]
        stringArray = [w.replace('1', 'rec.sport.hockey') for w in stringArray]
        stringArray = [w.replace('2', 'sci.crypt') for w in stringArray]
        stringArray = [w.replace('3', 'talk.politics.mideast') for w in stringArray]
        labels = stringArray

        #labels = ddteval_data["labels"]
        #urls = ddteval_data["urls"]

        nro_cluster = 3
        yPredKmeans = self.Kmeans(data, nro_cluster )

        print "***************Sonia***************************"
        #[clusterData, labels_cluster, X_sum] = self.getRandomSample_inCluster( nro_cluster, yPredKmeans, data, labels)
        [clusterData, labels_cluster, X_sum, features_uniques] = self.getAllSamples_inCluster_RemoveCommonFeatures( nro_cluster, yPredKmeans, data, labels)
        stringArray = labels_cluster
        data = clusterData

        features = features_uniques
        #tf_v = tfidf_vectorizer(convert_to_ascii=True, max_features=max_features)
        #[X, features] = tf_v.vectorize(data)
        X = csr_matrix(X_sum)

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

        urls = stringArray
        labels = stringArray
        titles = stringArray
        snippets = stringArray
        image_urls = stringArray

        self.radviz = Radviz(X, features, labels, urls)

        return_obj = {}
        for i in range(0, len(features)):
            return_obj[features[i]] = matrix_transpose[i,:].tolist()[0]
        #labels_urls = OrderedDict([("labels",labels), ("urls",urls), ("title", ddteval_data["title"]),("snippet",ddteval_data["snippet"]),("image_url",ddteval_data["image_url"])])
        labels_urls = OrderedDict([("labels",labels), ("urls",urls), ("title", titles),("snippet",snippets),("image_url",image_urls)])
        od = OrderedDict(list(OrderedDict(sorted(return_obj.items())).items()) + list(labels_urls.items()))

        return od

    def computeTSP(self):
        return self.radviz.compute_tsp()
