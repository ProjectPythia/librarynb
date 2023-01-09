# LibraryNB

## Description
LibraryNB is a cross platform application that provides a convenient way to import and run git repositories of Jupyter Notebooks on your local machine. It handles the process of cloning the repository, creating the Conda environment, and launching Jupyter Lab in a desktop environment on your system. It currently runs on only Windows and Linux.

## Installation
### Prerequisites

LibraryNB assumes you have git configured and installed on your computer. It also assumes that you have either Conda or Mamba installed on your system. Mamba is currently recommended. Conda has not been tested.

### Linux
Start by acquiring the deb or rpm package, depending on your systems package manager, from the release section of this repository. Then run
```bash
sudo apt install ./librarynb_{version}_{arch}.{ext}
```
in the directory where you downloaded the package.

### First run
When ran the first time LibraryNB will ask you a few questions to configure itself to your system. Once you have answered the questions and pressed "Save", LibraryNB will exit and will be ready to use.

## Security
LibraryNB makes no attempt to determine the trustworthiness of Jupyter Notebooks or Conda environments specified in git repositories. You should never use LibraryNB on git repositories you don't trust.

## Current State
This software is very early in its development. It should not be considered secure or stable at this time. Use at your own risk.

## Development
Please feel free to create an issue for any problem you encounter using this software. Pull requests are welcome.

### Direction for the future
Current development focuses on bringing LibraryNB to more platforms and increasing the stability of the application. 

### Design Decisions
LibraryNB does not use containers to provide consistent environments to run Jupyter Notebooks. It instead uses just Conda or Mamba to create virtual environments.

Additionaly LibraryNB does not impose a specific git workflow upon the user. LibraryNB only clones repositories. git should work like normal on the cloned repository.

### Integration with Jupyter Book

LibraryNB can read a "_config.yml" files in a repository to provide information about a repository to the user. This includes a title, author, thumbnail, logo, and copyright info.




