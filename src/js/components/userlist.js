
const userListTemplate = document.createElement('template');
userListTemplate.innerHTML = `<style>
.adjunct {
    background-color:lightgrey;
  }

  .people-list {

  }
  .people-list .sorted::after {
    content: "↑";
  }
</style>
<div class=people-list>
<table class=peoplelist-table>
  <thead>
    <tr>
     <th data-name=name>Name</th>
     <th data-name=s1load>S1</th>
     <th data-name=s2load>S2</th>
     <th data-name=s3load>S3</th>
     <th data-name=load>Overall</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>
</div>
</div>`;



export class UserList extends HTMLElement {

    constructor() {
        // Always call super first in constructor
        super();

        this._year = ''
        this._people = [];
        this._sortedColumn = "name";
        //this._root = this.attachShadow({mode: 'open'});
        this._root = this; // don't use shadow root

    }

    connectedCallback() {

        this._root.appendChild(userListTemplate.content.cloneNode(true));
        this.$tableContainer = this._root.querySelector(".people-list tbody");

        this.addEventListener('click', e => {
            if (e.originalTarget.tagName === "TH") {
                this._sortedColumn = e.originalTarget.dataset.name;
                this._render();
            }
        });

        this._render();
    }

    get people() {
        return this._people;
    }

    set people(value) {
        this._people = value;
        this._render();
    }

    set year(value) {
        this._year = value
    }

    _render() {
        if (this.$tableContainer) {           
            this._sort();

            let html = '';
            this._people.forEach(e=>{
                    const adjunctclass = e.adjunct ? 'adjunct': '';
                    const row = `<tr>
                    <td class=${adjunctclass}><a href="#!/${this._year}/staff/${e.id}">${e.first_name} ${e.last_name}</a></td>
                    <td>${e.load['Session 1'].toFixed(1)}</td>
                    <td>${e.load['Session 2'].toFixed(1)}</td>
                    <td>${e.load['Session 3'].toFixed(1)}</td>                    
                    <td>${e.load.total.toFixed(1)}</td>
                    </tr>`;
                    html = html + row;
            
            })
            this.$tableContainer.innerHTML = html;

            this._root.querySelectorAll('th').forEach(element => {
                if (element.dataset.name == this._sortedColumn) {
                    element.className = 'sorted';
                } else {
                    element.className = '';
                }
            })
        }
    }

    _sort() {
        if (this._sortedColumn === "name") {
            this._people.sort((a, b) => a.name > b.name);
        } else if (this._sortedColumn === "s1load") {
            this._people.sort((a, b) => b.load['Session 1'] - a.load['Session 1'])
        } else if (this._sortedColumn === "s2load") {
            this._people.sort((a, b) => b.load['Session 2'] - a.load['Session 2'])
        } else if (this._sortedColumn === "s3load") {
            this._people.sort((a, b) => b.load['Session 3'] - a.load['Session 3'])
        } else {
            this._people.sort((a, b) => b.load.total - a.load.total)
        }
    }

  }

customElements.define('user-list', UserList);

