const Modal = {
    //uma função dentro de um objeto
    //se chama MÉTODO
    openFirstModal() {
        document.querySelector('.modal-overlay').classList.add('active')
    },

    openSecondModal() {
        document.querySelector('.second-modal-overlay').classList.add('active')
    },

    closeFirstModal() {
        document.querySelector('.modal-overlay').classList.remove('active')
    },

    closeSecondModal() {
        document.querySelector('.second-modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("excel.maria:first.container.transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("excel.maria:first.container.transactions", JSON.stringify(transactions))  
    }
}

const Transaction = {
    all: Storage.get(),
    //todas as transações registradas pelo usuário 

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0
        //pegar todas as transacoes 
        //para cada transacao,
        Transaction.all.forEach(transaction =>  {
            //se ela for maior que zero 
            if (transaction.amount > 0) {
                //somar a uma variavel e retornar a variavel 
                income += transaction.amount
            }
        })
        return income
    },

    expenses() {
        let expense = 0
        //pegar todas as transacoes 
        //para cada transacao,
        Transaction.all.forEach(transaction => {
            //se ela for menor que zero
            if (transaction.amount < 0) {
                //somar a uma variavel e retornar a variavel
                expense += transaction.amount
            }
        })
        return expense
    },

    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    datosDelTitular: document.querySelector('#segundaColunaTitular'),
    datosDeSimulacion: document.querySelector('#segundaColunaSimulacion'),
    dataTable: document.querySelector('#data-table tbody'),

    
    addTransaction(transaction, index) {

        const { firstContainerHTML, secondContainerHTML, thirdContainerHTML } = DOM.innerHTMLTransaction(transaction, index)    
        const objectLength = Object.values(transaction).length

        if (objectLength == 5) {

            const tr = document.createElement('tr')
            tr.innerHTML = firstContainerHTML
            tr.dataset.index = index
            DOM.transactionsFirstContainer.appendChild(tr)
        } else if (objectLength == 11) {

            const secondContainertr = document.createElement('tr')
            secondContainertr.innerHTML = secondContainerHTML
            DOM.transactionsSecondContainer.appendChild(secondContainertr)

            const thirdContainertr = document.createElement('tr')
            thirdContainertr.innerHTML = thirdContainerHTML
            DOM.transactionsThirdContainer.appendChild(thirdContainertr)
        }       
    },

    innerHTMLTransaction(transaction, index) {

            let datosDelTitularHTML = 
                `
                <p>${transaction.titular}</p>
                <p>${transaction.identidad}</p>
                <p>${transaction.cuenta}</p>
                <p>${transaction.tipoTarjeta}</p>
                <p>${transaction.numeroTarjeta}</p>  
                <a class="delete-button"> 
                    <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
                </a>
            
                `

            let datosDeSimulacionHTML = 
                `
                <td class="numeroSimulacion">${transaction.numeroSimulacion}</td>
                <td class="linea">${transaction.linea}</td>
                <td class="monto">${transaction.monto}</td>
                <td class="cuotas">${transaction.cuotas}</td>
                <td class="tasaMensual">${transaction.tasaMensual}</td>     
                <td class="tasaAnual">${transaction.tasaAnual}</td>     
                <td class="intereses">${transaction.intereses}</td>                 
                <td>
                    <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
                </td>
                `

            let dataTableHTML = 
                `
                <td class="moneda">${transaction.moneda}</td>     
                <td class="vcto">${transaction.vcto}</td>  
                <td class="fechaSimulacion">${transaction.fechaSimulacion}</td>  
                <td class="codigoUsuario">${transaction.codigoUsuario}</td> 
                <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
                </td>

                `

            return {
                datosDelTitularHTML,
                datosDeSimulacionHTML,
                dataTableHTML
            }

        // const CSSclass = transaction.amount > 0 ? "income" : "expense"
        // // const amount = Utils.formatCurrency(transaction.amount)
    },

    updateBalance() {
        document
                .getElementById('incomeDisplay')
                .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
                .getElementById('expenseDisplay')
                .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
                .getElementById('totalDisplay')
                .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.datosDelTitular.innerHTML = ""
        DOM.datosDeSimulacion.innerHTML = ""
        DOM.dataTable.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = Number(value.replace(/\,\./g, "")) * 100
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}

const FirstForm = {    
    titular: document.querySelector('#titular'),
    identidad: document.querySelector('#identidad'),
    cuenta: document.querySelector('#cuenta'),
    tipoTarjeta: document.querySelector('#tipoTarjeta'),
    numeroTarjeta: document.querySelector('#numeroTarjeta'),


    getValues() {
        return {
            titular: FirstForm.titular.value,
            identidad: FirstForm.identidad.value,
            cuenta: FirstForm.cuenta.value,
            tipoTarjeta: FirstForm.tipoTarjeta.value,
            numeroTarjeta: FirstForm.numeroTarjeta.value
        }
    },
    
    validateFields() {
        const { titular, identidad, cuenta, tipoTarjeta, numeroTarjeta } = FirstForm.getValues()

        //trim = tira espaços vazios de uma string
        //abaixo, se ele varre uma string vazia, o resultado é vazio
        if (titular.trim() === "" ||
            identidad.trim() === "" ||
            cuenta.trim() === "" ||
            tipoTarjeta.trim() === "" ||
            numeroTarjeta.trim() === "") {
                throw new Error("Por favor, llene todas tus informaciones!")
            } else {
                return {
                    titular,
                    identidad,
                    cuenta,
                    tipoTarjeta,
                    numeroTarjeta
                }
            }
    },

    // formatValues() {
    //     let { titular, identidad, cuenta, tipoTarjeta, numeroTarjeta } = FirstForm.getValues()

    //     titular = Utils.formatAmount(titular)
    //     identidad = Utils.formatAmount(identidad)
    //     cuenta = Utils.formatAmount(cuenta)
    //     tipoTarjeta = Utils.formatAmount(tipoTarjeta)
    //     numeroTarjeta = Utils.formatAmount(numeroTarjeta)

    //     return {
    //         titular,
    //         identidad,
    //         cuenta,
    //         tipoTarjeta,
    //         numeroTarjeta
    //     }
    // },

    clearFields(){
        FirstForm.titular.value = ""
        FirstForm.identidad.value = ""
        FirstForm.cuenta.value = ""
        FirstForm.tipoTarjeta = ""
        FirstForm.numeroTarjeta = ""
    },
    
    submit(event) {
        event.preventDefault()
        
        try {
            const transaction = FirstForm.validateFields()
            Transaction.add(transaction)
            // FirstForm.clearFields()
            // Modal.closeFirstModal() 
        } catch(error) {
            alert(error.message)
        }
    }
}

const SecondForm = {
    numeroSimulacion: document.querySelector('#numeroSimulacion'),
    linea: document.querySelector('#linea'),
    monto: document.querySelector('#monto'),
    cuotas: document.querySelector('#cuotas'),
    tasaMensual: document.querySelector('#tasaMensual'),
    tasaAnual: document.querySelector('#tasaAnual'),
    intereses: document.querySelector('#intereses'),
    moneda: document.querySelector('#moneda'),
    vcto: document.querySelector('#vcto'),
    fechaSimulacion: document.querySelector('#fechaSimulacion'),
    codigoUsuario: document.querySelector('#codigoUsuario'),

    getValues() {
        return {
            numeroSimulacion: SecondForm.numeroSimulacion.value,
            linea: SecondForm.linea.value,
            monto: SecondForm.monto.value,
            cuotas: SecondForm.cuotas.value,
            tasaMensual: SecondForm.tasaMensual.value,
            tasaAnual: SecondForm.tasaAnual.value,
            intereses: SecondForm.intereses.value,
            moneda: SecondForm.moneda.value,
            vcto: SecondForm.vcto.value,
            fechaSimulacion: SecondForm.fechaSimulacion.value,
            codigoUsuario: SecondForm.codigoUsuario.value
        }
    },

    validateFields() {
        const { numeroSimulacion, linea, monto, cuotas, tasaMensual, tasaAnual, intereses, moneda, vcto, fechaSimulacion, codigoUsuario } = SecondForm.getValues()
        
        //possível melhoria
        if (numeroSimulacion.trim() === "" ||
            linea.trim() === "" ||
            monto.trim() === "" ||
            cuotas.trim() === "" ||
            tasaMensual.trim() === "" ||
            tasaAnual.trim() === "" ||
            intereses.trim() === "" ||
            moneda.trim() === "" ||
            vcto.trim() === "" ||
            fechaSimulacion.trim() === "" ||
            codigoUsuario.trim() === "") {
                throw new Error("Por favor, llene todas tus informaciones")
            } else {
                return {
                    numeroSimulacion,
                    linea,
                    monto, 
                    cuotas, 
                    tasaMensual, 
                    tasaAnual, 
                    intereses, 
                    moneda, 
                    vcto, 
                    fechaSimulacion, 
                    codigoUsuario
                }
            }    
    },

    formatValues() {
        let { numeroSimulacion, linea, monto, cuotas, tasaMensual, 
                tasaAnual, intereses, moneda, vcto, 
                fechaSimulacion, codigoUsuario } = SecondForm.getValues()

        linea = Utils.formatAmount(linea)
        monto = Utils.formatAmount(monto)
        tasaMensual = Utils.formatAmount(tasaMensual)
        tasaAnual = Utils.formatAmount(tasaAnual)
        intereses = Utils.formatAmount(intereses)
        fechaSimulacion = Utils.formatDate(fechaSimulacion)  

        return {
            numeroSimulacion, 
            linea,
            monto,
            cuotas,
            tasaMensual,
            tasaAnual,
            intereses,
            moneda,
            vcto,
            fechaSimulacion,
            codigoUsuario
        }       
    },


    submit(event) {
        event.preventDefault()

        try {
            SecondForm.validateFields()
            const transaction = SecondForm.formatValues()  
            Transaction.add(transaction)

        } catch(error) {
            alert(error.message)
        }
    }


}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        // Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

// App.init()