# Workload Model for Computing @ Macquarie

This project implements the workload model for the Computing Department. 

Input is a set of spreadsheets describing unit offerings and allocations, one for each year.
Each spreadsheet should have sheets:

Units sheet

Unit Code - eg. COMP1000
Title - unit title
Session - 'Session 1', 'Session 2' or 'Session 3'
Enrollment - projected enrolment for this offering, integer
New Unit - 1 if this is a new unit, blank otherwise, unit will attract a loading
Co Taught - unit code of any co-taught unit (eg. COMP6100)
Lecture Type - 'Mature', 'Refreshed', as per the workload model, or 'PACE' for PACE units

Activities sheet

Unit Code - matching those in Units sheet
Title
Session - 'Session 1', 'Session 2' or 'Session 3'
Activity - 'Lecturer', 'Convener'
Quantity - fraction allocated 0-1 for lecturer/convener, workload points allocated for marking
New - additional load for staff new to the unit or new to teaching, workload points
Staff - staff name, matching name in Staff sheet
Notes - any notes on the allocation

Staff sheet

Name - eg. 'Cassidy, Steve'
Adjunct - 'A' if the staff member is an adjunct, blank otherwise
S1 - target load for S1
S2 - target load for S2

## Running the Model

Requires that you have node.js installed.  Download/clone this repository. To install dependencies run:

```
npm install
```

The project requires a configuration file to tell it where the spreadsheets are.
Copy `allocation-config-dist.json` to `allocation-config.json` and edit the 
path names to point to your copies of the allocation spreadsheets. 

To monitor the spreadsheets you also need to edit `package.json` to put the
correct directory name in the `"preprocess"` line. 

To build the web pages and serve them locally run:

```
npm start
```

This will serve pages on http://localhost:1234/.  It will monitor for changes in 
the spreadsheets and the project code and should regenerate and refresh the page
when you save the spreadsheet file. 

## Code Structure

The project is in two parts.  `src/js/preprocess.js` reads the spreadsheets and
generates a JSON version of the data with workload calculations added.   The 
web interface is then generated via the Javascript incldued in `index.html` - this is 
bundled and served by `parcel`.  `parcel serve` will run a local server and watch
for changes.  `parcel build` will build a single file version with all data etc
embedded and written to `dist/index.html`.

The script `publish.sh` runs the build process and uploads the result to my (Steve's)
web space.  
