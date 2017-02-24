from radviz import Radviz
import  numpy as np
from collections import OrderedDict
import json
from sklearn import linear_model
from online_classifier import OnlineClassifier
#import urllib2
#from bs4 import BeautifulSoup

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

    # Update online classifer
    def classify(self, traindata, labelsTrainData, testDataSet):
        #preprocessingData
        trainDataObj = json.loads(traindata)
        testDataSetObj = json.loads(testDataSet)
        trainData = []
        testData = []
        for item in trainDataObj:
            trainData.append(item.values())
        for item in testDataSetObj:
            testData.append(item.values())
        labelsTrainData = labelsTrainData.split('|')
        pos_train_length = 0
        neg_train_length = 0
        for i in labelsTrainData:
            print i
            if i=="relevant":
                pos_train_length = pos_train_length + 1
            else: neg_train_length = neg_train_length + 1
        #train_data : training data.
        train_data = np.array(trainData)
        #pos_neg_labels : labes of training data.
        pos_neg_labels = np.array(labelsTrainData)
        #test_data: unlabelled data
        test_data = np.array(testData)

        # Fit classifier
        # ****************************************************************************************
        #[X_train, X_test] = self.vectorize(train, test)
        #print "\n\n\nNew relevant samples ", len(pos_text),"\n", "New irrelevant samples ",len(neg_text), "\n\n\n"
        onlineClassifier = None
        onlineClassifier = OnlineClassifier()
        clf = None
        onlineClassifier.partialFit(train_data, pos_neg_labels)

        # ****************************************************************************************
        # Fit calibratrated classifier
        accuracy = 0
        if train_data != None:
          if 2*pos_train_length/3  > 2 and 2*neg_train_length/3 > 2:
            calibrate_data = train_data
            calibrate_labels = pos_neg_labels

            train_indices = np.random.choice(len(calibrate_labels), 2*len(calibrate_labels)/3)
            test_indices = np.random.choice(len(calibrate_labels), len(calibrate_labels)/3)

            sigmoid = onlineClassifier.calibrate(calibrate_data[train_indices], np.asarray(calibrate_labels)[train_indices])
            if not sigmoid is None:
              accuracy = round(onlineClassifier.calibrateScore(sigmoid, calibrate_data[test_indices], np.asarray(calibrate_labels)[test_indices]), 4) * 100
              print "Accuracy: ", accuracy

              print "\n\n\n Accuracy = ", accuracy, "%\n\n\n"
            else:
              print "\n\n\nNot enough data for calibration\n\n\n"
          else:
            print "\n\n\nNot enough data for calibration\n\n\n"

          # ****************************************************************************************

        # Label unlabelled data

        unsure = 0
        label_pos = 0
        label_neg = 0
        unlabeled_urls = []
        calibp_class = []
        sigmoid = sigmoid
        if sigmoid != None:
          # Check if unlabeled data available
          if len(test_data) > 0:
            unlabeled_data =  test_data
            [classp, calibp, cm] = onlineClassifier.predictClass(unlabeled_data,sigmoid)
            calibp_class = calibp
            entries = {}
            for i in range(len(calibp)):
              entry = {}
              if calibp[i]=="relevant":
                  if cm[i][1] < 60:
                      calibp_class[i]="neutral"
              else:
                  if cm[i][0] < 60:
                      calibp_class[i]="neutral"
            print calibp_class

        entries = {}
        entries["accuracy"] = accuracy
        entries["predictClass"] = calibp_class.tolist()
        return entries




    # def classify(self, train, train_labels, test, test_labels, partial=False):
    def classifyAux(self, traindata, labelsTrainData, testDataSet):
        trainDataObj = json.loads(traindata)
        testDataSetObj = json.loads(testDataSet)
        trainData = []
        testData = []
        for item in trainDataObj:
            trainData.append(item.values())
        for item in testDataSetObj:
            testData.append(item.values())
        labelsTrainData = labelsTrainData.split('|')
        X_train = np.array(trainData)
        train_labels = np.array(labelsTrainData)
        clf = linear_model.SGDClassifier()
        clf = clf.fit(X_train, train_labels)
        predictedClass = clf.predict(testData)


    def computeTSP(self):
        return self.radviz.compute_tsp()
