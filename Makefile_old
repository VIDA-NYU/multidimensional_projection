# Makefile for Domain Discovery Tool development
# Type "make" or "make all" to build the complete development environment 
# Type "make help" for a list of commands

# Variables for the Makefile
.PHONY = conda_environment cherrypy_config 
SHELL := /bin/bash
CONDA_ROOT := $(shell conda info --root)
CONDA_ENV := $(CONDA_ROOT)/envs/mdproj

CONDA_ENV_TARGET := $(CONDA_ENV)/conda-meta/history
CHERRY_PY_CONFIG_TARGET := server/config.conf
TSP_SOLVER_TARGET := ${PWD}/lib/tsp-solver-master/build

# Makefile commands, see below for actual builds

## all              : set up mdproj development environment
all: conda_env cherrypy_config tsp_solver

## help             : show all commands.
# Note the double '##' in the line above: this is what's matched to produce
# the list of commands.
help                : Makefile
	@sed -n 's/^## //p' $<

## conda_env        : Install/update a conda environment with needed packages
conda_env: $(CONDA_ENV_TARGET)

## cherrypy_config  : Configure CherryPy (set absolute root environment)
cherrypy_config: $(CHERRY_PY_CONFIG_TARGET)

tsp_solver: $(TSP_SOLVER_TARGET)

# Actual Target work here

$(CONDA_ENV_TARGET): environment.yml
	conda env update

$(CHERRY_PY_CONFIG_TARGET): server/config.conf-in
	sed "s#tools.staticdir.root = .#tools.staticdir.root = ${PWD}/client#g" server/config.conf-in > server/config.conf

$(TSP_SOLVER_TARGET): ${PWD}/lib/tsp-solver-master.zip
	source activate mdproj; \
	unzip ${PWD}/lib/tsp-solver-master.zip -d ${PWD}/lib; \
	pushd ${PWD}/lib/tsp-solver-master; \
	python setup.py install; \
	popd	

