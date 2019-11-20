"""
 Implement the 2020 FSE Workload Model for Computing
"""
import tablib
from typing import List, Dict, Tuple

from model import compute_load

# TODO: Read list of staff allocations and calculate assigned workload

def read_unit_info(excelfile: str) -> Dict:

    with open(excelfile, 'rb') as fd:
        data = tablib.Dataset().load(fd.read(), format="xlsx")
        
    assert(data.headers == ['Unit Code', 'Title', 'Session', 'Enrollment', 'New Unit', 'Co Taught', 'Lecture Type'])

    units = {}
    for row in data.dict:
        if row['Unit Code'] is not None:
            key = "{}-{}".format(row['Unit Code'], row['Session'])
            units[key] = {
                'code': row['Unit Code'],
                'session': row['Session'],
                'title': row['Title'],
                'enrollment': row['Enrollment'],
                'co-taught': row['Co Taught'],
                'new-unit': row['New Unit'],
                'lecture-type': row['Lecture Type']
            }
    
    return units

def consolidate_units(units: Dict) -> Dict: 
    """Given a set of units, combine the enrollments of co-taught 
    units together and remove the co-taught versions"""

    result = units.copy()
    for code in units:
        ct = units[code]['co-taught']
        if ct is not None:
            key = "{}-{}".format(ct, units[code]['session'])
            # add enrollment to main unit
            result[key]['enrollment'] = units[key]['enrollment'] + units[code]['enrollment']
            result[key]['co-taught-with'] = units[code]['code']
            result[key]['co-taught-enrolled'] = units[code]['enrollment']
            # remove from result
            del result[code]
    return result

def overall_load(units: Dict) -> List[Dict]:
    """Compute overall load for a list of units
    return a list of dictionaries"""

    units = consolidate_units(units)

    result = []
    total = 0
    tutorials = 0
    marking = 0
    for code in units:
        unit = units[code].copy()
        load = compute_load(unit['enrollment'], unit['new-unit'], unit['lecture-type'])
        unit.update(load)
        result.append(unit)

    return result

def write_overall(overall: Dict, filename: str) -> None:
    """Write out the overall load as an Excel file"""

    dataset: tablib.Dataset = tablib.Dataset()
    dataset.headers = [
        'Code', 'Title', 'Session', 'Enrollemnt', 'Co-Taught With', 'Co-Taught Enrollment',
        'Lecture Type', 'New Unit', 'Tutorial Classes',
        'Convening', 'Lecturing', 'Tutorial', 'Loading', 'Marking',
    ]
    for unit in overall:
        row = [
            unit['code'], unit['title'], unit['session'], unit['enrollment'], unit.get('co-taught-with', ''),
            unit.get('co-taught-enrolled', ''), 
            unit['lecture-type'], unit['new-unit'], unit['tutorial-classes'],
            unit['convening'], unit['lecturing'], unit['tutorial'], unit['loading'], unit['marking']
        ]
        dataset.append(row)

    with open(filename, 'wb') as out:
        out.write(dataset.export('xlsx'))

def read_allocation_workbook(excelfile: str) -> Tuple:
    """Read an allocation excel file with multiple sheets.
       Return a tuple of (staff, activities) where
        staff is a list of dictionaries one per staff member and
        activities is a list of dictionaries one per staff activity
    """

    with open(excelfile, 'rb') as fd:
        workbook = tablib.Databook().load(fd.read(), 'xlsx')

    activities = []
    staff = []
    for sheet in workbook.sheets():
        print(sheet.title)
        print(sheet.headers)
        if sheet.title == 'Activities': 
            activities = sheet.dict 
        if sheet.title == 'Staff':
            staff = sheet.dict  
    
    return staff, activities

if __name__=='__main__':

    #units: Dict = read_unit_info('data/unit-enrollments.xlsx')

    #load = overall_load(units)
    #write_overall(load, 'overall-load.xlsx')

    staff, allocation = read_allocation_workbook("data/allocation-2020.xlsx")

    for a in allocation:
        print(a)