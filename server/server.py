import cherrypy
from ConfigParser import ConfigParser
import json
import os
from threading import Lock
import urlparse
from RadvizModel import RadvizModel

class Page:
  @staticmethod
  def getConfig():
    # Parses file to prevent cherrypy from restarting when config.conf changes: after each request
    # it restarts saying config.conf changed, when it did not.
    config = ConfigParser()
    config.read(os.path.join(os.path.dirname(__file__), "config.conf"))

    configMap = {}
    for section in config.sections():
      configMap[section] = {}
      for option in config.options(section):
        # Handles specific integer entries.
        val = config.get(section, option)
        if option == "server.socket_port" or option == "server.thread_pool":
          val = int(val)
        configMap[section][option] = val

    return configMap


  # Default constructor reading app config file.
  def __init__(self):
    # Folder with html content.
    self._HTML_DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), u"../client/mdproj_react/build")
    self.lock = Lock()
    self.radvizModel = RadvizModel()

  # Access to seed crawler vis.
  @cherrypy.expose
  def mdprojvis(self):
    # TODO Use SeedCrawlerModelAdapter self._crawler = SeedCrawlerModelAdapter()
    return open(os.path.join(self._HTML_DIR, u"index.html"))

  @cherrypy.expose
  def index(self):
    return self.mdprojvis()

  @cherrypy.expose
  def getRadvizPoints(self):
    result = self.radvizModel.getRadvizPoints()
    return json.dumps(result)

  @cherrypy.expose
  def computeTSP(self):
    result = self.radvizModel.computeTSP()
    return json.dumps(result)

if __name__ == "__main__":
  page = Page()

  # CherryPy always starts with app.root when trying to map request URIs
  # to objects, so we need to mount a request handler root. A request
  # to "/" will be mapped to HelloWorld().index().
  app = cherrypy.quickstart(page, config=Page.getConfig())
  cherrypy.config.update(page.config)
  #app = cherrypy.tree.mount(page, "/", page.config)

  #if hasattr(cherrypy.engine, "signal_handler"):
  #    cherrypy.engine.signal_handler.subscribe()
  #if hasattr(cherrypy.engine, "console_control_handler"):
  #    cherrypy.engine.console_control_handler.subscribe()
  #cherrypy.engine.start()
  #cherrypy.engine.block()

else:
  page = Page()
  # This branch is for the test suite; you can ignore it.
  config = Page.getConfig()
  app = cherrypy.tree.mount(page, config=config)
