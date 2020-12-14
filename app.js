// BUDGET CONTROLLER
let budgetController = (function(){
    
    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        
        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }      

    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;            
        }) 
        data.totals[type] = sum;    
    }

    let data = { //THIS IS AN EFFICIENT WAY OF BUILDING A DATA STRUCTURE
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1,
    }

    return {
        addItem: function(type, des, val){
            let newItem;
            let ID = 0;

            // create new ID [5 6 4]
            if (data.allItems[type].length > 0){
                ID = (data.allItems[type][data.allItems[type].length - 1]).id + 1;
            } else {
                ID = 0;
            }
            
            //create new item based on type
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            // Pass in data structure
            data.allItems[type].push(newItem);

            // return new element
            return newItem;
        },

        deleteItem: function(type, id){
            // id = 6
            // ids = [1 2 4 6 8]
            // index = 3

            let ids, index;
            ids = data.allItems[type].map(function (current){
                return current.id;
            })
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            
            // calculate total income and expenses
               calculateTotal('exp');
               calculateTotal('inc');

            // calclate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;            
            
            // calculate percentage of income that we spent
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            /* 
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
             */
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            let allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },

        testing: function(){
            console.log(data);
        }
    }

})();

// UI CONTROLLER
let UIcontroller = (function(){
    
    let DOMstrings = { //having these kind of structures facilitates the situations of changes in the DOM
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel:'.item__percentage',
        dateLabel: '.budget__title--month'
    };

    
    let formatNumber = function(num, type){
        let numSplit, int, dec;
        /* 
        + or - before number
        exactly 2 decimal points
        comma separating thousands
        
        2000 -> 2,000.00
        */

        num = Math.abs(num); //le saca el signo negativo o positivo al número
        num = num.toFixed(2); //solo muestra dos decimales del número

        numSplit = num.split('.'); //esto separa el decimal de la parte entera
        int = numSplit[0]; //parte entera

        if (int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
            // returns the part of the string we want. First argument is where to start. Second is how many characters we want
        }

        dec = numSplit[1]; //decimal

        return (type === 'exp'? '-' : '+') + ' ' + int + '.' + dec;
    };

    nodeListForEach = function(list, callback){ //by making it separate we can reuse it

        for (let i = 0; i < list.length; i++){
            callback(list[i], i)
        }

    };

    // these are public methods
    return {
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value, //will be wither inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },
        addListItem: function(obj, type){
            let html, element;
            // create HTML string with placeholder text
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace placeholder with data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID){
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        //clearing HTML fields        
        clearFields: function(){
            let fields, fieldsArr;

            // using querySelectorAll
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // converting a list to an array
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){ //current: value of array currently being processed --- index: number going from zero to the length of the array minus one --- array: entire array
                current.value = "";
            })

            // focuses back on first field
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + ' %';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';                
            }                      
        },

        displayPercentages: function(percentages){
            let fields, nodeListForEach;

            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);            

            nodeListForEach(fields, function(cur, index){

                if (percentages[index] > 0){
                    cur.textContent = percentages[index] + ' %';
                } else {
                    cur.textContent = '---';
                }

                
            });

        },

        displayMonth: function() {
            let now, year, months, month;

            now = new Date();
            // e.g: let christmas = new Date(2016, 12, 25)

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function(){

            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur){

                cur.classList.toggle('red-focus'); //toggle adds it when it's not there and remove it if it's there

            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function(){
            return DOMstrings;
        },
    }

})();

// GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UIctrl){

    // setting up event listeners for keypress events
    let setupEventListeners = function(){

        let DOM = UIctrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem) //se usa punto porque es el selector de class

        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which === 13){ //using the event object
                ctrlAddItem();
            }
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);
    }
    
    let updateBudget = function(){       

        // 1. Calculate budget
        budgetCtrl.calculateBudget()

        // 2. Return the budget (we need a method that returns budget so we can store it in a variable and then pass it on to the UI controller)
        let budget = budgetCtrl.getBudget();

        // 5. Display new budget on UI
        UIctrl.displayBudget(budget);
    }

    let updatePercentages = function(){
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();        

        // 2. Read percentages from budget controller
        let percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with new percentages
        UIctrl.displayPercentages(percentages);

    };

    let ctrlAddItem = function(){
        let input, newItem;

        // 1. Get the field input data
        input = UIctrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){            

            // 1. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 2. Add new item to UI
            UIctrl.addListItem(newItem, input.type);

            // 3. Clear the fields
            UIctrl.clearFields(); 

            // 4. Calculate and update budget
            updateBudget();

            // 5. Calculate and update percentages
            updatePercentages();
        }
    }

    let ctrlDeleteItem = function(event){ //we need this event argument to know which is the target element
        let itemID, splitID, type, ID;//by using parentNode we move to the parent element(from i to button)
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID){//if we click anywhere else there's no ID so we can use this
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1.Delete the item from data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete item from UI
            UIctrl.deleteListItem(itemID);

            // 3. Update and show new budget
            updateBudget();

            
            // 4. Calculate and update percentages
            updatePercentages();
        }      
        
    };
    
    return {
        init: function(){
            setupEventListeners();
            UIctrl.displayMonth();
            UIctrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0,
            });
        }
    }

})(budgetController, UIcontroller);

controller.init(); 