# Multidimensional Projection

This repository contains the Multidimensional Projection (MDPROJ) project. MDPROJ is an interactive system that helps users explore and better understand a multidimensional dataset such as text data. It achieves this by using RadViz to support interaction with web pages that along with preserving the correlations (similarity and dissimilarity) of pages also displays its attributes, i.e.,  the words in the document. This produces a more interpretable 2-dimensional projection of the web pages which makes it easier for the user to determine the relevance or irrelevance of the pages.

## Installing on your machine

Building and deploying the MDPROJ can be done using its Makefile to create a local development environment.

### Local development

First install conda, either through the Anaconda or miniconda installers provided by Continuum.  You will also need Git.  These are system tools that are generally not provided by conda.

Clone the MDPROJ repository and enter it:

```
https://github.com/ViDA-NYU/multidimensional_projection
cd multidimensional_projection
```

Use the `make` command to build MDPROJ and download/install its dependencies.

```
make
```

After a successful installation, you can activate the MDPROJ development environment:

```
source activate mdproj
```

And (from the top-level `multidimensional_projection` directory), run:

```
python server/server.py
```

Now you should be able to head to http://localhost:4400/ to interact
with the tool.

## Contact

Sonia Castelo Quispe [s.castelo@nyu.edu]
Jorge Piazentin Ono [jorgehpo@nyu.edu]
Yamuna Krishnamurthy [yamuna@nyu.edu]






