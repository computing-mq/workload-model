"""
 Implement the 2020 FSE Workload Model for Computing
"""
from http.server import BaseHTTPRequestHandler
from typing import Callable, Dict, List, Tuple

from watchdog.observers import Observer
from watchdog.events import LoggingEventHandler, DirModifiedEvent

import tablib

import model

# TODO: Add columns to unit-enrollments for: lecture hours/wk, tutorial hours/wk
# TODO: Add columns to activities for: marking load (points), tutorials (number)

def read_unit_info(excelfile: str) -> Dict:

    with open(excelfile, 'rb') as fd:
        data = tablib.Dataset().load(fd.read(), format="xlsx")
        
    assert(data.headers == ['Unit Code', 'Title', 'Session', 'Enrollment', 
            'New Unit', 'Co Taught', 'Lecture Type',
            'Lecture Hours', 'SGTA Hours'])

    units = {}
    for row in data.dict:
        if row['Unit Code'] is not None:
            key = offering_key(row['Unit Code'], row['Session'])
            units[key] = {
                'code': row['Unit Code'],
                'session': row['Session'],
                'title': row['Title'],
                'enrollment': row['Enrollment'],
                'co-taught': row['Co Taught'],
                'new-unit': row['New Unit'],
                'lecture-type': row['Lecture Type'],
                'lecture-hours': row['Lecture Hours'],
                'sgta-hours': row['SGTA Hours'],
            }
    
    return units

def offering_key(code: str, session: str) -> str:
    """Generate a key for this offering"""

    return "{}-{}".format(code, session)

def consolidate_units(units: Dict) -> Dict: 
    """Given a set of units, combine the enrollments of co-taught 
    units together and remove the co-taught versions"""

    result = units.copy()
    for code in units:
        ct = units[code]['co-taught']
        if ct is not None:
            key = offering_key(ct, units[code]['session'])
            # add enrollment to main unit
            result[key]['enrollment'] = units[key]['enrollment'] + units[code]['enrollment']
            result[key]['co-taught-with'] = units[code]['code']
            result[key]['co-taught-enrolled'] = units[code]['enrollment']
            # remove from result
            del result[code]
    return result

def overall_load(units: Dict) -> Dict[str, Dict]:
    """Compute overall load for a list of units
    return a dictionary with offerings as keys
    and values being a dictionary which is the result of compute_load"""

    units = consolidate_units(units)

    result = {}
    total = 0
    tutorials = 0
    marking = 0
    for code in units:
        unit = units[code].copy()
        load = model.compute_load(unit)
        unit.update(load)
        result[code] = unit

    return result

def write_overall(overall: Dict, filename: str, format: str='xlsx') -> None:
    """Write out the overall load as an Excel file"""

    dataset: tablib.Dataset = tablib.Dataset()
    dataset.headers = [
        'Code', 'Title', 'Session', 'Enrollemnt', 'Co-Taught With', 'Co-Taught Enrollment',
        'Lecture Type', 'New Unit', 'Tutorial Classes',
        'Convening', 'Lecturing', 'Tutorial', 'Loading', 'Marking',
    ]
    for unit in overall.values():
        row = [
            unit['code'], unit['title'], unit['session'], unit['enrollment'], unit.get('co-taught-with', ''),
            unit.get('co-taught-enrolled', ''), 
            unit['lecture-type'], unit['new-unit'], unit['tutorial-classes'],
            unit['convener'], unit['lecturer'], unit['tutorial'], unit['loading'], unit['marking']
        ]
        dataset.append(row)

    with open(filename, 'wb') as out:
        out.write(dataset.export(format))


def read_allocation_workbook(excelfile: str) -> Tuple[tablib.Dataset, tablib.Dataset]:
    """Read an allocation excel file with multiple sheets.
       Return a tuple of (staff, activities) where
        staff is the staff sheet, one row per staff member
        activities is the activities sheet, one row per allocated activity
    """

    with open(excelfile, 'rb') as fd:
        workbook = tablib.Databook().load(fd.read(), 'xlsx')

    activities = []
    staff = []
    for sheet in workbook.sheets():
        if sheet.title == 'Activities': 
            activities = sheet 
        if sheet.title == 'Staff':
            staff = sheet  
    
    return staff, activities

def calculate_activity_load(units: Dict, overall_load: Dict) -> Callable:
    """Generate a load calculation function to add a column to
    a dataset
    """

    def row_function(row: Tuple) -> float:

        #print(len(row), row)
        code, title, session, activity, quantity, staff, notes = row

        key = offering_key(code, session)

        activity = activity.lower()
        assert(activity in ['lecturer', 'convener', 'marking', 'tutorial', 'bonus', 'project'])

        if key not in overall_load:
            print("Load for offering", key, "not found")
            return 0.0

        if activity in ['convener', 'lecturer']:
            load = overall_load[key][activity] * quantity 

        elif activity == 'tutorial':
            sgta_per_week = units[key]['sgta-hours']
            load = model.tutorial(quantity * sgta_per_week)
        elif activity == 'project':
            load = model.project_supervision(quantity)
        else:
            load = quantity

        return load

    return row_function

def add_unit_activities(activities: tablib.Dataset, overall_load: Dict) -> tablib.Dataset:
    """For each allocated lecturing activity allocate 
    marking and tutoral activities 
    """
    result = []
    for row in activities.dict:
        key = offering_key(row['Unit Code'], row['Session'])
        # check that we have a load for this unit, if not, it isn't running (eg. co-taught)
        if key in overall_load:
            load = overall_load[key]
            newrow = row.copy()
            del newrow['Marking']
            del newrow['SGTA']
            del newrow['New']

            result.append(newrow)  # copy over

            if row['Marking'] is not None:
                # assign some marking to each lecturer
                newrow = {
                    'Unit Code': row['Unit Code'],
                    'Title' : row['Title'],
                    'Session': row['Session'],
                    'Activity': 'Marking',
                    'Quantity': min(row['Marking'], load['marking']*row['Quantity']),
                    'Staff': row['Staff'],
                    'Notes': 'Added Marking allocation'
                }
                result.append(newrow)

            if row['SGTA'] is not None:
                newrow = {
                    'Unit Code': row['Unit Code'],
                    'Title' : row['Title'],
                    'Session': row['Session'],
                    'Activity': 'Tutorial',
                    'Quantity': row['SGTA'],
                    'Staff': row['Staff'],
                    'Notes': 'Added Tutorial allocation'
                }
                result.append(newrow)

            # add bonus points as an explicit row
            if row['Activity'] == 'Lecturer' and (load['new-unit'] or row['New'] is not None):
                newrow = {
                    'Unit Code': row['Unit Code'],
                    'Title' : row['Title'],
                    'Session': row['Session'],
                    'Activity': 'Bonus',
                    'Quantity': (row['New'] or 0.0) + model.unit_loading(load['new-unit']) * row['Quantity'],
                    'Staff': row['Staff'],
                    'Notes': 'Bonus Points'
                }
                result.append(newrow)

    newdataset = tablib.Dataset()
    newdataset.dict = result
    return newdataset

class MyHandler():

    def dispatch(self, event):

        if type(event) == DirModifiedEvent:
            units: Dict = read_unit_info('data/unit-enrollments.xlsx')

            overall = overall_load(units)
            write_overall(overall, 'src/overall-load.xlsx')

            staff, allocation = read_allocation_workbook("data/allocation-2020.xlsx")

            allocation = add_unit_activities(allocation, overall)

            allocation.insert_col(-1, calculate_activity_load(units, overall), header='Load')

            with open("src/allocation-load.xlsx", 'wb') as out:
                out.write(allocation.xlsx)

            with open("src/allocation-load.json", "w") as out:
                allocation.headers = [x.replace(' ', '_') for x in allocation.headers]
                allocation.headers = [x.lower() for x in allocation.headers]
                print(allocation.headers)
                out.write(allocation.export('json'))

            logging.info("Wrote allocation-load.json")

if __name__=='__main__':
    import logging

    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s - %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S')

    event_handler = MyHandler()
    log_handler = LoggingEventHandler()
    observer = Observer()
    observer.schedule(event_handler, 'data', recursive=True)
    observer.schedule(log_handler, 'data', recursive=True)
    observer.start()
    try:
        while observer.isAlive():
            observer.join(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
 
