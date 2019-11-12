"""
Implementation of the FSE workload model for Computing
"""
from typing import List, Dict, Tuple
import math

def convening(enrollment: int) -> float:
    """Compute convening load for a unit enrollment
    Include load for consultation and assessment + exam development
    """
    
    result: float = 0.0

    if enrollment > 0:
        result = 0.8 + 0.09 * ((enrollment-1) ** 0.7) 
        result += min(0.002*enrollment, 2.0)  # consultation load
        result += 1.75                        # assessment and exam development

    return result


def lecturing(ltype: str, per_week: int) -> float:
    """Compute lecturing load for a unit
    ltype is one of 'Mature', 'Refreshed' or 'Repeat'
    """

    lecture_types = {
        'Mature': 0.2,
        'Refreshed': 0.3,
        'Repeat': 0.08
    }
    if ltype not in lecture_types:
        print("Unknownn lecture type: '{}'".format(ltype))
        exit()

    return 13 * per_week * lecture_types[ltype]


def tutorial(per_week: int) -> float:
    """Compute total workload for a single tutorial class"""

    return 13 * per_week * 0.2

def marking(enrollment: int, per_student: int) -> float:
    """Compute marking load for a unit given an assumed
    time per student
    """
    return 0.063 * per_student * enrollment

def unit_loading(new_unit: bool, new_to_unit: bool) -> float:
    """Compute unit loadings for new unit development or new-to-unit"""

    result: float = 0.0

    # Up to 10 points per year, as agreed in advance with HoD, 
    # or up to 20 points for those in Teaching and Leadership 
    # roles with HoD approval.
    if new_unit:
        result += 5.0
    
    # Up to 10 points in a year, and at most 50% of the base allocation 
    # in any given unit, as agreed in advance with HoD.
    if new_to_unit:
        result += 3.0

    return result

def compute_load(enrollment: int, new_unit: int, ltype: str) -> Dict:
    """Compute the required load for this unit offering in points
    Return a dictionary with keys:
    - 'convening'
    - 'lecturing'
    """

    n_tutorial: int = math.ceil(enrollment/30)

    return {
        'convening': convening(enrollment),
        'lecturing': lecturing(ltype, 3) if enrollment > 0 else 0,
        'loading': unit_loading(new_unit == 1.0, False),
        'tutorial-classes': n_tutorial,
        'tutorial': tutorial(2) * n_tutorial,
        'marking': marking(enrollment, 1.0)  # 1 hr per student
    }