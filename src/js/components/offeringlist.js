
const offeringListTemplate = document.createElement('template');
offeringListTemplate.innerHTML = `<style>
  .offering-table {
    overflow-y: scroll;
    max-height: 800px;
  }
</style>

<div>
  <form>
     <input type='text' class=filterbox placeholder="Filter">
  </form>
  <button id='unallocated'>Under Allocated</button>
  <button id='reset'>Reset</button>

<div class=offering-list>
<table class=offering-table>
  <thead>
    <tr>
       <th data-name=code>Code</th>
       <th data-name=title>Title</th>
       <th data-name=convener>C</th>
       <th data-name=lecturer>L</th>
     <!--
       <th data-name=convener>C(A)</th>
       <th data-name=lecturer>L(A)</th>
       <th data-name=tutorialClasses>T</th>
       <th data-name=marking>M</th>
       -->
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>
</div>
</div>`;


export class OfferingTable extends HTMLElement {

    constructor() {
        // Always call super first in constructor
        super();
 
        this._year = ''
        this._offerings = []; 
        this._displayedOfferings = [];
        //this._root = this.attachShadow({mode: 'open'});
        this._root = this; // don't use shadow root
    }

    connectedCallback() {

        this._root.appendChild(offeringListTemplate.content.cloneNode(true));
        this.$tableContainer = this._root.querySelector(".offering-list tbody");
        this.$filterBox = this._root.querySelector(".filterbox");
        this.$filterBox.addEventListener('keyup', () => this.filter());

        this.$unalloc = this._root.querySelector("#unallocated");
        this.$unalloc.addEventListener('click', () => this.unallocated());

        this.$reset = this._root.querySelector("#reset");
        this.$reset.addEventListener('click', () => this.resetFilter());

        this._render();
    }

    get offerings() {
        return this._offerings;
    }

    set offerings(value) {
        this._offerings = value;
        this.filter(); 
    }

    set year(value) {
      this._year = value
    }

    filter() {
        if (this.$filterBox) {
            const filterTerm = this.$filterBox.value.toLowerCase();
            this._displayedOfferings = this._offerings.filter(e=>
                e.id.toLowerCase().includes(filterTerm) || e.title.toLowerCase().includes(filterTerm)
            )
        } else {
            this._displayedOfferings = this._offerings;
        }
        this._render();
    }

    unallocated() { 
      this._displayedOfferings = this._displayedOfferings.filter(e=> {
        return e.allocated.convener < 1 || e.allocated.lecturer < 1
      })
      this._render();
    }

    resetFilter() {
        this._displayedOfferings = this._offerings;
        this.$filterBox.value = '';
        this._render();
    }
    _render() {
        if (this.$tableContainer) {
            let html = '';

            this._displayedOfferings.forEach(e=>{
                html = html + `<tr>
                <td><a href="#!/${this._year}/offerings/${e.id}">${e.id}</a></td>
                <td>${e.title}</td>
                <td>${e.allocated.convener}</td>
                <td>${e.allocated.lecturer}</td>
                </tr>`
            });

            /* 
                <td>${e.allocated.adjunctConvener}</td>
                <td>${e.allocated.adjunctLecturer}</td>
                <td>${e.allocated.tutorialClasses}/${e.load.tutorialClasses}</td>
                <td>${e.allocated.marking.toFixed(1)}%</td>
                */

            this.$tableContainer.innerHTML = html;

        }
    }

  }

customElements.define('offering-table', OfferingTable);

