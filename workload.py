"""
 Implement the 2020 FSE Workload Model for Computing
"""
import xlrd
import tablib
from typing import List, Dict, Tuple

from model import compute_load

# TODO: Read list of units with enrollment (and other metadata) and calculate required workload
# TODO: Read list of staff allocations and calculate assigned workload

def read_unit_info(excelfile: str) -> Dict:

    workbook: xlrd.book = xlrd.open_workbook(excelfile)
    sheet: xlrd.sheet = workbook.sheet_by_index(0)
    units: Dict = {}

    # validate column headings
    headings: List = [cell.value for cell in sheet.row(0)]
    assert(headings == ['Unit Code', 'Title', 'Session', 'Enrollment', 'New Unit', 'Co Taught', 'Lecture Type'])

    for i in range(1, sheet.nrows):
        code, title, session, enrol, new_unit, cotaught, ltype= [c.value for c in sheet.row(i)]
        key = "{}-{}".format(code, session)
        units[key] = {
            'code': code,
            'session': session,
            'title': title,
            'enrollment': enrol,
            'co-taught': cotaught,
            'new-unit': new_unit,
            'lecture-type': ltype
        }
    
    return units

def consolidate_units(units: Dict) -> Dict: 
    """Given a set of units, combine the enrollments of co-taught 
    units together and remove the co-taught versions"""

    result = units.copy()
    for code in units:
        ct = units[code]['co-taught']
        if ct != '':
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
    

if __name__=='__main__':

    units: Dict = read_unit_info('data/unit-enrollments.xlsx')

    load = overall_load(units)
    write_overall(load, 'overall-load.xlsx')

    exit()


    units = consolidate_units(units)

    total = 0
    tutorials = 0
    marking = 0
    for code in units:
        unit = units[code]

        load = compute_load(unit['enrollment'], unit['new-unit'], unit['lecture-type'])

        total += load['convening'] + load['lecturing'] + load['loading']
        tutorials += load['tutorial']
        marking += load['marking']
        print(code, unit['title'], "{convening:.2f}, {lecturing:.2f}, {loading:.2f}".format_map(load))

    fte = total / 40
    print("Convening + Lecturing {:.2f} points. FTE staff @ 40% {:.2f}".format(total, fte))
    print("Marking {:.2f} points. FTE staff @ 40% {:.2f}".format(marking, marking/40))
    print("Tutorials  {:.2f} points. FTE staff  @ 40% {:.2f}".format(tutorials, tutorials/40))