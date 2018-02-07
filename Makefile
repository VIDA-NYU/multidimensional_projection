# Makefile for Domain Discovery Tool development
# Type "make" or "make all" to build the complete development environment
# Type "make help" for a list of commands

# Variables for the Makefile
.PHONY = cherrypy_config clean nltk_data
SHELL := /bin/bash
CONDA_ROOT := $(shell conda info --root)
CONDA_ENV := $(CONDA_ROOT)/envs/mdproj

CONDA_ENV_TARGET := $(CONDA_ENV)/conda-meta/history
CHERRY_PY_CONFIG_TARGET := server/config.conf
TSP_SOLVER_TARGET := ${PWD}/lib/tsp-solver-master/build
GET_REACT_DATA_TARGET := client/build/index.html
GET_NLTK_DATA_TARGET := nltk_data/corpora nltk_data/tokenizers

# Makefile commands, see below for actual builds

## all              : set up mdproj development environment
all: conda_env cherrypy_config tsp_solver get_react_data get_nltk_data

## help             : show all commands.
# Note the double '##' in the line above: this is what's matched to produce
# the list of commands.
help                : Makefile
	@sed -n 's/^## //p' $<

clean:
	rm -rf client/build; \
	rm server/config.conf

## conda_env        : Install/update a conda environment with needed packages
conda_env: $(CONDA_ENV_TARGET)

## cherrypy_config  : Configure CherryPy (set absolute root environment)
cherrypy_config: $(CHERRY_PY_CONFIG_TARGET)

## get_nltk_data    : Download NLTK corpus and tokenizers 
get_nltk_data: $(GET_NLTK_DATA_TARGET)

tsp_solver: $(TSP_SOLVER_TARGET)

## get_react_data : Download react packages
get_react_data: $(GET_REACT_DATA_TARGET)

# Actual Target work here

$(CONDA_ENV_TARGET): environment.yml
	conda env update

$(CHERRY_PY_CONFIG_TARGET): server/config.conf-in
	sed "s#tools.staticdir.root = .#tools.staticdir.root = ${PWD}/client/build#g" server/config.conf-in > server/config.conf

$(TSP_SOLVER_TARGET): ${PWD}/lib/tsp-solver-master.zip
	source activate mdproj; \
	unzip ${PWD}/lib/tsp-solver-master.zip -d ${PWD}/lib; \
	pushd ${PWD}/lib/tsp-solver-master; \
	python setup.py install; \
	popd

$(GET_NLTK_DATA_TARGET): $(CONDA_ENV)
	source activate mdproj; \
	python -m nltk.downloader -d ${PWD}/nltk_data stopwords brown punkt averaged_perceptron_tagger

$(GET_REACT_DATA_TARGET):
	source activate mdproj; \
	pushd client; \
	npm install; \
	python fix_for_npm_child_process_issue.py; \
	npm run build; \
	popd
