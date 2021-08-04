$.fn.ajaxTable = function(options) {

    // set up template
    template = `
        <div class="ajax-table-pager"></div>
        <table>
            <thead></thead>
            <tbody></tbody>
        </table>
    `;

    $(this).addClass('ajax-table');
    if (!$(this).html()) {
        $(this).html(template);
    }

    // get constants
    const pager = $(this).find('.ajax-table-pager');
    const thead = $(this).find('thead');
    const tbody = $(this).find('tbody');
    const that = this;
    
    // set up options
    options.text = options.text || '';
    options.page = options.page || 0;
    options.pageSize = options.pageSize || 7;
    options.orderBy = options.orderBy || 'name';
    options.orderDir = options.orderDir || 'asc';

    this.url = options.url; 
    this.upArrow = options.upArrow || '&#8593';
    this.downArrow = options.downArrow || '&#8595';

    // we don't want to send these options for the server
    delete options.url;
    delete options.upArrow;
    delete options.downArrow;

    this.refresh = function() {
        $.get(this.url, options, function(content) {
            const data = JSON.parse(content);
            that.createHeaders(thead, data, options);
            that.createContent(tbody, data, options);
            that.createPager(pager, data, options);
        });
    };

    this.createHeaders = function(thead, data, options) {
        thead.html('');
        const row = $('<tr>');
        for (let i = 0; i < data.headers.length; i++) {
            const header = data.headers[i];
            const headerElem = that.createHeader(header, options);
            row.append(headerElem);
        }
        thead.append(row);
    };    

    this.createHeader = function(header, options) {
        const result = $('<th>');
        let label = this.createHeaderLabel(header, options);
        let link = this.createHeaderLink(label, header, options);
        result.append(link);
        if (header.field == options.orderBy) {            
            result.addClass('ajax-table-header-active');
        } else {
            result.removeClass('ajax-table-header-active');
        }        
        return result;
    };

    this.createHeaderLabel = function(header, options) {
        let label = header.label;
        if (header.field == options.orderBy) {
            label += options.orderDir == 'asc' ? this.upArrow : this.downArrow;
        }
        return label;
    };

    this.createHeaderLink = function(label, header, options) {
        const link = $('<a>');
        link.html(label);
        link.click(function () {
            if (options.orderBy == header.field) {
                options.orderDir = options.orderDir == 'asc' ? 'desc' : 'asc';
            } else {
                options.orderDir = 'asc';
            }
            options.orderBy = header.field;
            that.refresh();
        });
        return link;        
    }

    this.createContent = function(tbody, data, options) {
        tbody.html('');
        for (let j = 0; j < data.items.length; j++) {
            const row = $('<tr>');
            for (let i = 0; i < data.headers.length; i++) {
                const header = data.headers[i];
                const cell = $('<td>');
                cell.text(data.items[j][header.field]);
                row.append(cell);                
            }
            tbody.append(row);
        }
    };

    this.createPager = function(pager, data, options) {
        const allPages = Math.ceil(data.count / options.pageSize);
        pager.html('');
        for (let i = 0; i < allPages; i++) {
            const link = $('<a>');            
            if (i == options.page) {
                link.addClass('ajax-table-pager-active');
            } else {
                link.removeClass('ajax-table-pager-active');
            }
            link.text(i + 1);
            link.click(function() {
                options.page = i;
                that.refresh();
            });
            pager.append(link);
        }        
    }

    this.refresh();

    return this;
};