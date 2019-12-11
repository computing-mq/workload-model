Workload Model for Computing @ Macquarie
==

This project implements the 2020 workload model for the Computing Department. 

Input is a set of spreadsheets describing unit offerings and allocations.

unit-enrollments.xlsx - single sheet with columns:

Unit Code - eg. COMP1000
Title - unit title
Session - 'Session 1', 'Session 2' or 'Session 3'
Enrollment - projected enrolment for this offering, integer
New Unit - 1 if this is a new unit, blank otherwise, unit will attract a loading
Co Taught - unit code of any co-taught unit (eg. COMP6100)
Lecture Type - 'Mature', 'Refreshed', as per the workload model, or 'PACE' for PACE units



allocation.xlsx - spreadsheet with at least two sheets named 'Activities' and 'Staff'

Activities sheet
Unit Code - matching those in unit-enrollments
Title
Session - 'Session 1', 'Session 2' or 'Session 3'
Activity - 'Lecturer', 'Convener'
Quantity - fraction allocated 0-1 for lecturer/convener, workload points allocated for marking
New - additional load for staff new to the unit or new to teaching, workload points
Staff - staff name, eg. 'Cassidy, Steve'
Notes - any notes on the allocation


Model Implementation
---

The workload model is implemented in [model.py](model.py). Procedures compute the 
overall load for different activities in a unit offering. 

* Convening load includes load for consultation and assessment + exam development
* Lecturing load varies by lecture type, assumes 13*3hr lectures and models additional PACE loading of +5 points


Workload Computation
---

The [workload.py](workload.py) script reads the source spreadsheets and computes
the workload for each activity in the allocation.  

