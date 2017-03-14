from radviz import Radviz
import  numpy as np
from collections import OrderedDict
import json
from sklearn import linear_model
from domain_discovery_API.online_classifier.tf_vector import tf_vectorizer
from domain_discovery_API.models.domain_discovery_model import DomainModel
from domain_discovery_API.elastic.config import es, es_doc_type, es_server
from fetch_data import fetch_data

#import urllib2
#from bs4 import BeautifulSoup

class RadvizModel(DomainModel):
    radviz = None

    def getRadvizPoints(self, index, filterByTerm):
        max_features = 200
        ddteval_data = fetch_data(index, filterByTerm, es_doc_type=es_doc_type, es=es)
        data = ddteval_data["data"]

        labels = ddteval_data["labels"]

        urls = ddteval_data["urls"]

        tf_v = tf_vectorizer(convert_to_ascii=True, max_features=max_features)
        [X, features] = tf_v.vectorize(data)

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

        self.radviz = Radviz(X, features, labels, urls)

        return_obj = {}
        for i in range(0, len(features)):
            return_obj[features[i]] = matrix_transpose[i,:].tolist()[0]
        labels_urls = OrderedDict([("labels",labels), ("urls",urls), ("title", ddteval_data["title"]),("snippet",ddteval_data["snippet"]),("image_url",ddteval_data["image_url"])])
        od = OrderedDict(list(OrderedDict(sorted(return_obj.items())).items()) + list(labels_urls.items()))

        return od

    def computeTSP(self):
        return self.radviz.compute_tsp()
