from radviz import Radviz
import  numpy as np
from collections import OrderedDict
import urllib2
from bs4 import BeautifulSoup

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

    def getURLsMetadata(self):
        self.radviz = Radviz()
        urls = self.radviz.loadSampleNames("data/ht_data_urls_200.csv")
        url = 'https://www.escortpost.com/escorts/city_oregon/area_portland/gender_female'
        cont = 0
        for url in urls:
            print "url: ", url
            req = urllib2.Request(url, headers={'User-Agent' : "Magic Browser"})
            try:
                external_sites_html = urllib2.urlopen( req )
                #external_sites_html = urllib2.urlopen(url)

                soup = BeautifulSoup(external_sites_html, "html.parser")
                    # First get the meta description tag
                #print soup
                description = soup.find('meta', attrs={'name':'og:description'}) or soup.find('meta', attrs={'property':'og:description'}) or soup.find('meta', attrs={'property':'description'}) or soup.find('meta', attrs={'name':'description'}) or soup.find('meta', attrs={'name':'Description'})
                    # If description meta tag was found, then get the content attribute and save it to db entry
                #print "Description: ", description


                if description:
                    description2 = description.get('content')
                    print "i: ", cont
                    print "description2: ", description2
                    cont = cont + 1
            except Exception:
                 pass  # or you could use 'continue'
                 print "i: ", cont
                 cont = cont + 1


        return urls

    def computeTSP(self):
        return self.radviz.compute_tsp()
