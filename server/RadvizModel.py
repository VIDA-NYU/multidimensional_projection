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

    def getRadvizPoints(self, session, filterByTerm):
        es_info = self._esInfo(session['domainId'])
        index = es_info['activeDomainIndex']
        max_features = 200
        ddteval_data = fetch_data(index, filterByTerm, es_doc_type=es_doc_type, es=es)

        categories = ['alt.atheism', 'talk.religion.misc', 'comp.graphics']
        newsgroups_train = fetch_20newsgroups(subset='train', categories=categories)

        #data = ddteval_data["data"]
        data = newsgroups_train.data
        #print data
        stringLabels = map(str, newsgroups_train.target)
        stringArray = [w.replace('0', 'alt.atheism') for w in stringLabels]
        stringArray = [w.replace('1', 'talk.religion.misc') for w in stringArray]
        stringArray = [w.replace('2', 'comp.graphics') for w in stringArray]
        labels = stringArray

        #labels = ddteval_data["labels"]

        #urls = ddteval_data["urls"]
        urls = stringArray

        tf_v = tfidf_vectorizer(convert_to_ascii=True, max_features=max_features)
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

        #titles = ddteval_data["title"]
        #snippets = ddteval_data["snippet"]
        #image_urls = ddteval_data["image_url"]

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
