
const tableTemplate = document.createElement('template');
tableTemplate.innerHTML = `<style></style>

<h5></h5>
<h6>Subhead</h6>
<table class=u-full-width>
  <thead></thead>
  <tbody></tbody>
</table>
`;


export class DataTable extends HTMLElement {

    constructor() {
        // Always call super first in constructor
        super();
 
        this._offerings = []; 
        this._displayedOfferings = [];
        //this._root = this.attachShadow({mode: 'open'});
        this._root = this; 
    }

    connectedCallback() {

        this._root.appendChild(tableTemplate.content.cloneNode(true));
        this.$thead = this._root.querySelector("thead");
        this.$tbody = this._root.querySelector("tbody");
        this.$h = this._root.querySelector('h5');
        this.$sh = this._root.querySelector('h6')

        this._render();
    }

    get headings() {
        return this._headings;
    }

    set headings(value) {
        this._headings = value;
    }

    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
        this._render();
    }

    set title(value) {
        this._title = value;
    }

    set subtitle(value) {
        this._subtitle = value;
    }

    _render() {
        if (this.$tbody) {
            let html = '';
            this.$tbody.innerHTML = '';

            if (this._title) { 
                this.$h.innerHTML = this._title; 
            }
            if (this._subtitle) { 
                this.$sh.innerHTML = this._subtitle; 
            }

            const row = this.$thead.appendChild(document.createElement('tr'))
            for(let key in this._headings) {
                const td = row.appendChild(document.createElement('th'));
                td.innerHTML = this._headings[key].title;
            }
            
            this._data.forEach(e=>{
                const row = this.$tbody.appendChild(document.createElement('tr'))
                for(let key in this._headings) {
                    
                    const td = row.appendChild(document.createElement('td'));
                    if (this._headings[key].format) { 
                        td.innerHTML = this._headings[key].format(e);
                    } else { 
                        td.innerHTML = e[key];
                    }
                }
            });
        }
    }

  }

customElements.define('data-table', DataTable);

