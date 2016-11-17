import joblib
#from pytsp import run, dumps_matrix
from tsp_solver.greedy import solve_tsp
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


class  Radviz:
    data = None
    features = None
    labels = None
    sampleNames = None
    
    def loadData_pkl(self, pkl_file):
        self.data = joblib.load(pkl_file)
        print self.data
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
                    print matData, np.shape(matData)
                    cities = solve_tsp(matData)
                    print cities
                    return {"cities": cities, "groupId": 0, "offset": 0}
