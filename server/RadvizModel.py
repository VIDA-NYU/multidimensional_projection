from radviz import Radviz
import  numpy as np
from collections import OrderedDict

class RadvizModel:
    radviz = None
    
    def getRadvizPoints(self):
        self.radviz = Radviz()
        data = self.radviz.loadData_pkl("data/ht_data_200.pkl").todense()

        data = np.transpose(data)
        
        features = self.radviz.loadFeatures("data/ht_data_features_200.csv")
        print features
        print len(features)
        labels = self.radviz.loadLabels("data/ht_data_labels_200.csv")
        urls = self.radviz.loadSampleNames("data/ht_data_urls_200.csv")
        
        return_obj = {}
        for i in range(0, len(features)):
            return_obj[features[i]] = data[i,:].tolist()[0]
        labels_urls = OrderedDict([("labels",labels), ("urls",urls)])

        od = OrderedDict(list(OrderedDict(sorted(return_obj.items())).items()) + list(labels_urls.items()))
        
        return od

    def computeTSP(self):
        return self.radviz.compute_tsp()
        
            
        
        
        
