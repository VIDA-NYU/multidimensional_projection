import joblib
#from pytsp import run, dumps_matrix
from tsp_solver.greedy import solve_tsp
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix, lil_matrix

class  Radviz:
    data = None
    features = None
    labels = None
    sampleNames = None
    labels_medoid_cluster = None
    X_medoid_cluster = None

    def __init__(self, data, features, labels, sampleNames,   labels_medoid_cluster,X_medoid_cluster ):
        self.data = data
        self.features = features
        self.labels = labels
        self.sampleNames = sampleNames
        self.labels_medoid_cluster = labels_medoid_cluster
        self.X_medoid_cluster = X_medoid_cluster

    def loadData_pkl(self, pkl_file):
        self.data = joblib.load(pkl_file)
        return self.data

    def loadFeatures(self, f_file):
        f = open(f_file)
        self.features = f.readlines()[0].strip().split(",")
        return self.features

    def loadSampleNames(self, s_file):
        f = open(s_file)
        self.sampleNames = f.readlines()[0].strip().split("*")
        return self.sampleNames

    def loadLabels(self, l_file):
        f = open(l_file)
        self.labels = f.readlines()[0].strip().split(",")
        return self.labels

    def compute_tsp(self):
        max_value=30000;
        if (self.data != None):
            if (len(self.features) > 0):
                if(len(self.features)<=2):
                    order = range(0,len(self.features))
                else:
                    matData = 1-cosine_similarity(np.transpose(self.data))
                    cities = solve_tsp(matData)
                    return {"cities": cities, "groupId": 0, "offset": 0}

    def compute_MedoidCluster(self, features_tsp):
        print "***************************************"
        print features_tsp
        nro_cluster = len(self.X_medoid_cluster)
        print nro_cluster
        features_tsp = np.unique(features_tsp).tolist()
        cluster_labels = []
        new_X_sum = []

        print "\n\n tf 1-gram matrix size PREVIOUS= ", np.shape(self.X_medoid_cluster)

        for i in range(nro_cluster):
            new_X = np.zeros(len(features_tsp))
            for j in range(len(self.features)): #loop over the cluster's features
                try:
                    index_feat = features_tsp.index(self.features[j])
                    new_X[index_feat]=self.X_medoid_cluster[i][j]
                except ValueError:
                    print "error"
            new_X_sum.append(np.asarray(new_X))
            cluster_labels.append(self.labels_medoid_cluster[i])

        X = csr_matrix(new_X_sum)
        matrix_transpose = np.transpose(X.todense())
        print "\n\n Number of 1-gram features = ", len(features_tsp)
        print "\n\n tf 1-gram matrix size = ", np.shape(X)
        return_obj = {}
        for i in range(0, len(features_tsp)):
            return_obj[features_tsp[i]] = matrix_transpose[i,:].tolist()[0]
        #labels_urls = OrderedDict([("labels",labels), ("urls",urls), ("title", ddteval_data["title"]),("snippet",ddteval_data["snippet"]),("image_url",ddteval_data["image_url"])])
        labels_urls = OrderedDict([("labels",cluster_labels), ("pred_labels",cluster_labels)])
        od = OrderedDict(list(OrderedDict(sorted(return_obj.items())).items()) + list(labels_urls.items()))

        return od
