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
        Transaction.all.forEach(transaction => {
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
    },

}

const DOM = {
    datosDelTitular: document.querySelector('#segundaColunaTitular'),
    datosDeSimulacion: document.querySelector('#segundaColunaSimulacion'),
    dataTable: document.querySelector('#data-table tbody'),


    addTransaction(transaction, index) {

        const { datosDelTitularHTML, datosDeSimulacionHTML } = DOM.innerHTMLTransaction(transaction, index)
        const objectLength = Object.values(transaction).length

        if (objectLength == 5) {
            DOM.datosDelTitular.innerHTML = datosDelTitularHTML
        } else if (objectLength == 10) {
            DOM.datosDeSimulacion.innerHTML = datosDeSimulacionHTML
            DOM.setWholeTable(transaction)
        }
    },

    innerHTMLTransaction(transaction, index) {

        const linea = Utils.formatCurrency(transaction.linea)
        const monto = Utils.formatCurrency(transaction.monto)
        const tasaMensual = Utils.formatTasaMensual(transaction.tasaAnual, transaction.cuotas)
        const tasaAnual = transaction.tasaAnual / 100

        let datosDelTitularHTML =
            `
                <p>${transaction.titular}</p>
                <p>${transaction.identidad}</p>
                <p>${transaction.cuenta}</p>
                <p>${transaction.tipoTarjeta}</p>
                <p>${transaction.numeroTarjeta}</p>  
                <a class="delete-titular"> 
                    <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Titular">
                </a>
            
                `

        let datosDeSimulacionHTML =
            `
                <p>${transaction.numeroSimulacion}</p>
                <p>${linea}</p>
                <p>${monto}</p>
                <p>${transaction.cuotas}</p>
                <p>${tasaMensual} %</p>
                <p>${tasaAnual} %</p>
                <p>${transaction.intereses}</p>
                <p>${transaction.moneda}</p>
                <p>${transaction.vcto}</p>
                <p>${transaction.fechaSimulacion}</p>
                <p>${transaction.codigoUsuario}</p>              
                <a class="delete-simulacion"> 
                    <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Simulación">
                </a>
                `

        // let dataTableHTML = 
        //     `
        //     <td class="moneda">${transaction.moneda}</td>     
        //     <td class="vcto">${transaction.vcto}</td>  
        //     <td class="fechaSimulacion">${transaction.fechaSimulacion}</td>  
        //     <td class="codigoUsuario">${transaction.codigoUsuario}</td> 
        //     <td>
        //     <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        //     </td>

        //     `

        return {
            datosDelTitularHTML,
            datosDeSimulacionHTML
        }

        // const CSSclass = transaction.amount > 0 ? "income" : "expense"
        // // const amount = Utils.formatCurrency(transaction.amount)
    },

    setWholeTable(transaction) {

        DOM.dataTable.appendChild(DOM.setInitialRow(transaction.monto))

        for (i = 0; i < transaction.cuotas; i++) {
            let tr = document.createElement('tr')
            tr.innerHTML = DOM.setTableRows(i, transaction)
            DOM.dataTable.appendChild(tr)
        }
    },

    setInitialRow(monto) {

        let initialCuota = 0

        let formatMonto = Utils.formatCurrency(monto)

        let tr = document.createElement('tr')

        let html =
            `
        <td>${initialCuota}</td>
        <td></td>
        <td>${formatMonto}</td>
        <td></td>
        <td></td>
        <td></td>
        `

        tr.innerHTML = html

        return tr
    },

    setTableRows(index, transaction) {

        let { saldoCapital, interes, cuota, capitalAmortizado } = DOM.setTableData(transaction)
        let cuotaIndex = index + 1

        let html =
            `
            <td>${cuotaIndex}</td>
            <td></td>
            <td>${saldoCapital[index]}</td>
            <td>${capitalAmortizado[index]}</td>
            <td>${interes[index]}</td>
            <td>${cuota[index]}</td>
        `

        return html
    },

    setTableData(transaction) {

        let tasaMensual = Utils.formatTasaMensual(transaction.tasaAnual, transaction.cuotas)

        tasaMensual = tasaMensual / 100

        tasaMensual = tasaMensual.toFixed(9)

        let saldoCapital = []
        let interes = []
        let cuota = []
        let capitalAmortizado = []


        let saldoCapital = transaction.monto / 100

        let interes = saldoCapital * tasaMensual

        let cuota = Utils.formatCuotas(transaction, tasaMensual)

        let capitalAmortizado = cuota - interes

        saldoCapital = saldoCapital - capitalAmortizado

        saldoCapital = saldoCapital.toFixed(2)
        interes = interes.toFixed(2)
        cuota = cuota.toFixed(2)
        capitalAmortizado = capitalAmortizado.toFixed(2)



        return {
            saldoCapital,
            interes,
            cuota,
            capitalAmortizado
        }

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
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        // const signal = Number(value) < 0 ? "-" : ""
        // value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("es-PE", {
            style: "currency",
            currency: "PEN"
        })
        return value
    },

    formatTasaMensual(tasaAnual, cuota) {

        let firstValue = tasaAnual / 100
        firstValue = firstValue + 100
        firstValue = firstValue / 100

        let secondValue = 1 / cuota

        let finalValue = Math.pow(firstValue, secondValue)
        finalValue = finalValue - 1
        finalValue = finalValue * 100
        finalValue = finalValue.toFixed(2)

        return finalValue
    },

    formatCuotas(transaction, tasaMensual) {

        let monto = transaction.monto / 100

        let firstValue = Number(tasaMensual) + 1
        firstValue = Math.pow(firstValue, transaction.cuotas)
        firstValue = firstValue * Number(tasaMensual)

        let secondValue = Number(tasaMensual) + 1
        secondValue = Math.pow(secondValue, transaction.cuotas)
        secondValue = secondValue - 1

        let finalValue = firstValue / secondValue
        finalValue = finalValue * monto

        return finalValue
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

    clearFields() {
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
        } catch (error) {
            alert(error.message)
        }
    }
}

const SecondForm = {
    numeroSimulacion: document.querySelector('#numeroSimulacion'),
    linea: document.querySelector('#linea'),
    monto: document.querySelector('#monto'),
    cuotas: document.querySelector('#cuotas'),
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
            tasaAnual: SecondForm.tasaAnual.value,
            intereses: SecondForm.intereses.value,
            moneda: SecondForm.moneda.value,
            vcto: SecondForm.vcto.value,
            fechaSimulacion: SecondForm.fechaSimulacion.value,
            codigoUsuario: SecondForm.codigoUsuario.value
        }
    },

    validateFields() {
        const { numeroSimulacion, linea, monto, cuotas, tasaAnual, intereses, moneda, vcto, fechaSimulacion, codigoUsuario } = SecondForm.getValues()

        //possível melhoria
        if (numeroSimulacion.trim() === "" ||
            linea.trim() === "" ||
            monto.trim() === "" ||
            cuotas.trim() === "" ||
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
        let { numeroSimulacion, linea, monto, cuotas,
            tasaAnual, intereses, moneda, vcto,
            fechaSimulacion, codigoUsuario } = SecondForm.getValues()

        linea = Utils.formatAmount(linea)
        monto = Utils.formatAmount(monto)
        tasaAnual = Utils.formatAmount(tasaAnual)
        intereses = Utils.formatAmount(intereses)
        fechaSimulacion = Utils.formatDate(fechaSimulacion)

        return {
            numeroSimulacion,
            linea,
            monto,
            cuotas,
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

        } catch (error) {
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