"""
Implementation of the FSE workload model for Computing
"""
import math
from typing import Dict, Any

def convening(enrollment: int, pace: bool) -> float:
    """Compute convening load for a unit enrollment
    Include load for consultation and assessment + exam development
    """
    
    result: float = 0.0

    if enrollment > 0:
        result = 0.8 + 0.09 * ((enrollment-1) ** 0.7) 
        result += min(0.02*enrollment, 2.0)   # consultation load
        result += 1.0                         # assessment and exam development (max 1.75)

    if pace:
        result += 5.0   # bonus for PACE convening

    return result

def lecturing(ltype: str, per_week: int) -> float:
    """Compute lecturing load for a unit
    ltype is one of 'Mature', 'Refreshed' or 'Repeat'
    """

    lecture_types = {
        'Mature': 0.25,
        'PACE': 0.25,   # really Mature
    }
    if ltype not in lecture_types:
        print("Unknownn lecture type: '{}'".format(ltype))
        exit()

    return 13 * per_week * lecture_types[ltype]

def tutorial(per_week: int) -> float:
    """Compute total workload for a single tutorial class"""

    return 13 * per_week * 0.1  # low preparation prac/lab/workshop supervision
                                # assume prep work is part of convening/lecturing load

def marking(enrollment: int, per_student: float) -> float:
    """Compute marking load for a unit given an assumed
    time per student
    """
    return 0.063 * per_student * enrollment

def project_supervision(n: int) -> float:
    """Compute the load for supervising this many 
    coursework project students"""

    return 1.0 * n # Up to 1 point per student with HoD agreed allocation at unit level.

def unit_loading(new_unit: bool) -> float:
    """Compute unit loadings for new unit development"""

    result: float = 0.0

    # Up to 10 points per year, as agreed in advance with HoD, 
    # or up to 20 points for those in Teaching and Leadership 
    # roles with HoD approval.
    if new_unit:
        result += 5.0
    
    return result

def compute_load(unit: Dict[str, Any]) -> Dict:
    """Compute the required load for this unit offering in points
    Return a dictionary with keys:
    - 'convening'
    - 'lecturing'
    """

    n_tutorial: int = math.ceil(unit['enrollment']/30)

    # convener gets half of the convening load
    convening_load = convening(unit['enrollment'], unit['lecture-type'] == 'PACE')
    convener = convening_load/2
    loading = unit_loading(unit['new-unit'] == 1.0)
    # lectuer gets lecturing load + half convening load + loading unless no students
    if unit['enrollment'] > 0:
        lecturer = lecturing(unit['lecture-type'], unit['lecture-hours']) + convening_load/2
    else:
        lecturer = 0

    return {
        'convener': convener,
        'lecturer': lecturer,
        'loading': loading,
        'tutorial-classes': n_tutorial,
        'tutorial': tutorial(unit['sgta-hours']) * n_tutorial,
        'marking': marking(unit['enrollment'], 1.0)  # 1 hr per student
    }
