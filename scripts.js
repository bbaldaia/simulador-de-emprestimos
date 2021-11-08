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
        document.querySelector('#capitalAmortizadoCard').innerHTML = 'S/ 0,00'
        document.querySelector('#interesCard').innerHTML = 'S/ 0,00'
        document.querySelector('#cuotasCard').innerHTML = 'S/ 0,00'
        App.reload()
    },
}

const DOM = {
    datosDelTitular: document.querySelector('#segundaColunaTitular'),
    datosDeSimulacion: document.querySelector('#segundaColunaSimulacion'),
    dataTable: document.querySelector('#data-table tbody'),


    addTransaction(transaction, index) {

        const { datosDelTitularHTML, datosDeSimulacionHTML } = DOM.innerHTMLTransaction(transaction, index)

        switch (transaction.transactionType) {
            case 'titular':
                DOM.addDatosdelTitular(datosDelTitularHTML)
                break;
            case 'simulacion':
                DOM.addDatosdeSimulacion(datosDeSimulacionHTML, transaction)
                break;
            default:
                throw new Error("Invalid transaction!")
        }
    },

    addDatosdelTitular(datos) {
        DOM.datosDelTitular.innerHTML = datos
    },

    addDatosdeSimulacion(datos, transaction) {
        DOM.datosDeSimulacion.innerHTML = datos
        DOM.setWholeTable(transaction)
    },

    innerHTMLTransaction(transaction, index) {

        let linea = Utils.formatCurrency(transaction.linea)

        linea = linea.toLocaleString('es-PE', {
            style: 'currency',
            currency: 'PEN'
        })

        let monto = Utils.formatCurrency(transaction.monto)        
        
        let { totalInteresValue } = Utils.formatCardDataCurrency(transaction, monto)
        let tasaMensual = Utils.formatTasaMensual(transaction.tasaAnual, transaction.cuotas)
        tasaMensual = tasaMensual.toFixed(2)
        const tasaAnual = transaction.tasaAnual / 100

        monto = monto.toLocaleString('es-PE', {
            style: 'currency',
            currency: 'PEN'
        })

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
                <p>${totalInteresValue}</p>
                <p>${transaction.moneda}</p>
                <p>${transaction.vcto}</p>
                <p>${transaction.fechaSimulacion}</p>
                <p>${transaction.codigoUsuario}</p>              
                <a class="delete-simulacion"> 
                    <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Simulación">
                </a>
                `

        return {
            datosDelTitularHTML,
            datosDeSimulacionHTML
        }
    },

    setWholeTable(transaction) {

        let { firstTr, formattedMonto } = DOM.setInitialRow(transaction.monto)  

        DOM.dataTable.appendChild(firstTr)
        
        for (var i = 0; i < transaction.cuotas; i++) { 
                    
            let tr = document.createElement('tr')
            tr.innerHTML = DOM.returnTableRow(i, transaction, formattedMonto)
            DOM.dataTable.appendChild(tr)          
        }

        DOM.setCardData(transaction, formattedMonto)

    },

    setInitialRow(monto) {

        let initialCuota = 0

        let formattedMonto = Utils.formatCurrency(monto)

        let stringMonto = Utils.formatCurrency(monto).toLocaleString('es-PE', {
            style: 'currency',
            currency: 'PEN'
        })

        let firstTr = document.createElement('tr')

        let html =
            `
        <td>${initialCuota}</td>
        <td></td>
        <td class="currency">${stringMonto}</td>
        <td></td>
        <td></td>
        <td></td>
        `

        firstTr.innerHTML = html

        return {
            firstTr,
            formattedMonto
        } 
    },

    returnTableRow(index, transaction, formattedMonto) {

        let { saldoCapitalArray, interesArray, cuotaArray, capitalAmortizadoArray } = Utils.formatTableDataCurrency(transaction, formattedMonto)
        let cuotaIndex = index + 1

        let html =
            `
            <td>${cuotaIndex}</td>
            <td></td>
            <td class="currency">${saldoCapitalArray[index]}</td>
            <td class="currency">${capitalAmortizadoArray[index]}</td>
            <td class="currency">${interesArray[index]}</td>
            <td class="currency">${cuotaArray[index]}</td>
            `

        return html
    },

    setAllTableRowsData(transaction, formattedMonto) {
        
        let { saldoCapitalArray, interesArray, cuotaArray, capitalAmortizadoArray, tasaMensual } = DOM.setBaseTableRowData(transaction, formattedMonto)
        
        for (var i = 1; i < transaction.cuotas; i++) {
            interesArray[i] = saldoCapitalArray[saldoCapitalArray.length - 1] * tasaMensual
            cuotaArray[i] = cuotaArray[cuotaArray.length - 1]
            capitalAmortizadoArray[i] = cuotaArray[i] - interesArray[i]
            saldoCapitalArray[i] = saldoCapitalArray[saldoCapitalArray.length - 1] - capitalAmortizadoArray[i]
        }

        return {
            saldoCapitalArray,
            interesArray,
            cuotaArray,
            capitalAmortizadoArray
        }
    },

    reducingFloatNumbers(transaction, formattedMonto) {
        let { saldoCapitalArray, interesArray, cuotaArray, capitalAmortizadoArray } = DOM.setAllTableRowsData(transaction, formattedMonto)
        let totalInteresValue = 0
        let totalCuotaValue = 0
        let totalCapitalAmortizadoValue = 0

        for (var i = 0; i < transaction.cuotas; i++) {
            saldoCapitalArray[i] = Number(saldoCapitalArray[i].toFixed(2))
            interesArray[i] = Number(interesArray[i].toFixed(2))
            cuotaArray[i] = Number(cuotaArray[i].toFixed(2))
            capitalAmortizadoArray[i] = Number(capitalAmortizadoArray[i].toFixed(2))

            totalInteresValue = totalInteresValue + interesArray[i]
            totalCuotaValue = totalCuotaValue + cuotaArray[i]
            totalCapitalAmortizadoValue = totalCapitalAmortizadoValue + capitalAmortizadoArray[i]            
        }

        totalCapitalAmortizadoValue = Math.round(totalCapitalAmortizadoValue)

        totalInteresValue = Number(totalInteresValue.toFixed(2))
        totalCuotaValue = Number(totalCuotaValue.toFixed(2))
        totalCapitalAmortizadoValue = Number(totalCapitalAmortizadoValue.toFixed(2))

        return {
            saldoCapitalArray,
            interesArray,
            cuotaArray,
            capitalAmortizadoArray,
            totalInteresValue,
            totalCuotaValue,
            totalCapitalAmortizadoValue
        }
    },

    setBaseTableRowData(transaction, formattedMonto) {
        
        let saldoCapitalArray = []
        let interesArray = []
        let cuotaArray = []
        let capitalAmortizadoArray = []
        
        let tasaMensual = Utils.formatTasaMensual(transaction.tasaAnual, transaction.cuotas)

        tasaMensual = tasaMensual / 100
        
        tasaMensual = Number(tasaMensual.toFixed(9))

        let baseSaldoCapitalValue = formattedMonto

        let baseInteresValue = baseSaldoCapitalValue * tasaMensual

        let baseCuotaValue = Utils.formatCuotas(transaction, tasaMensual)

        let baseCapitalAmortizadoValue = baseCuotaValue - baseInteresValue

        baseSaldoCapitalValue = baseSaldoCapitalValue - baseCapitalAmortizadoValue

        saldoCapitalArray.push(baseSaldoCapitalValue)
        interesArray.push(baseInteresValue)
        cuotaArray.push(baseCuotaValue)
        capitalAmortizadoArray.push(baseCapitalAmortizadoValue)

        return {
            saldoCapitalArray,
            interesArray,
            cuotaArray,
            capitalAmortizadoArray,
            tasaMensual
        }
    },

    setCardData(transaction, formattedMonto) {
        let { totalCapitalAmortizadoValue, totalInteresValue, totalCuotaValue } = Utils.formatCardDataCurrency(transaction, formattedMonto)

        document.querySelector('#capitalAmortizadoCard').innerHTML = totalCapitalAmortizadoValue
        document.querySelector('#interesCard').innerHTML = totalInteresValue
        document.querySelector('#cuotasCard').innerHTML = totalCuotaValue

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

        value = Number(value) / 100

        return value
    },

    formatTableDataCurrency(transaction, formattedMonto) {
        let { saldoCapitalArray, interesArray, cuotaArray, capitalAmortizadoArray } = DOM.reducingFloatNumbers(transaction, formattedMonto)

        for (var i = 0; i < transaction.cuotas; i++) {
            saldoCapitalArray[i] = Number(saldoCapitalArray[i]).toLocaleString('es-PE', { 
                style: 'currency', 
                currency: 'PEN' 
            })

            interesArray[i] = Number(interesArray[i]).toLocaleString('es-PE', { 
                style: 'currency', 
                currency: 'PEN' 
            })

            cuotaArray[i] = Number(cuotaArray[i]).toLocaleString('es-PE', { 
                style: 'currency', 
                currency: 'PEN' 
            })

            capitalAmortizadoArray[i] = Number(capitalAmortizadoArray[i]).toLocaleString('es-PE', { 
                style: 'currency', 
                currency: 'PEN' 
            })
        }    

        return {
            saldoCapitalArray,
            interesArray,
            cuotaArray,
            capitalAmortizadoArray
        }
    },

    formatCardDataCurrency(transaction, formattedMonto) {
        let { totalInteresValue, totalCuotaValue, totalCapitalAmortizadoValue } = DOM.reducingFloatNumbers(transaction, formattedMonto)

        totalInteresValue = totalInteresValue.toLocaleString('es-PE', { 
            style: 'currency', 
            currency: 'PEN' 
        })

        totalCuotaValue = totalCuotaValue.toLocaleString('es-PE', { 
            style: 'currency', 
            currency: 'PEN' 
        })

        totalCapitalAmortizadoValue = totalCapitalAmortizadoValue.toLocaleString('es-PE', { 
            style: 'currency', 
            currency: 'PEN' 
        })

        return {
            totalInteresValue,
            totalCuotaValue,
            totalCapitalAmortizadoValue       
        }
    },

    formatTasaMensual(tasaAnual, cuota) {
        
        let firstValue = tasaAnual / 100
        firstValue = firstValue + 100
        firstValue = firstValue / 100
        
        let secondValue = 1 / 12
        secondValue = Number(secondValue.toFixed(9))
        
        
        let finalValue = Math.pow(firstValue, secondValue)
        finalValue = Number(finalValue.toFixed(9))
        finalValue = finalValue - 1
        finalValue = Number(finalValue.toFixed(9))
        //possível causa do problema: número é arredondado e não é o esperado
        finalValue = finalValue * 100

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
    },
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
        const transactionType = 'titular'
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
                numeroTarjeta,
                transactionType
            }
        }
    },

    clearFields() {
        FirstForm.titular.value = ""
        FirstForm.identidad.value = ""
        FirstForm.cuenta.value = ""
        FirstForm.tipoTarjeta.value = ""
        FirstForm.numeroTarjeta.value = ""
    },

    formattedValues() {
        let { titular, identidad, cuenta, tipoTarjeta, numeroTarjeta, transactionType } = FirstForm.validateFields()        
        let tarjetaArray = numeroTarjeta.split("")

        numeroTarjeta = `${tarjetaArray[0]}${tarjetaArray[1]}${tarjetaArray[2]}${tarjetaArray[3]}${tarjetaArray[4]}${tarjetaArray[5]}******${tarjetaArray[12]}${tarjetaArray[13]}${tarjetaArray[14]}${tarjetaArray[15]}`

        return {
            titular,
            identidad,
            cuenta,
            tipoTarjeta,
            numeroTarjeta,
            transactionType
        }
    },

    submit(event) {
        event.preventDefault()

        try {
            FirstForm.formattedValues()
            const transaction = FirstForm.formattedValues()
            Transaction.add(transaction)
            FirstForm.clearFields()
            Modal.closeFirstModal() 
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
            moneda: SecondForm.moneda.value,
            vcto: SecondForm.vcto.value,
            fechaSimulacion: SecondForm.fechaSimulacion.value,
            codigoUsuario: SecondForm.codigoUsuario.value
        }
    },

    validateFields() {
        const { numeroSimulacion, linea, monto, cuotas, tasaAnual, moneda, vcto, fechaSimulacion, codigoUsuario } = SecondForm.getValues()


        //possível melhoria
        if (numeroSimulacion.trim() === "" ||
            linea.trim() === "" ||
            monto.trim() === "" ||
            cuotas.trim() === "" ||
            tasaAnual.trim() === "" ||
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
                moneda,
                vcto,
                fechaSimulacion,
                codigoUsuario
            }
        }
    },

    formatValues() {
        const transactionType = 'simulacion'

        let { numeroSimulacion, linea, monto, cuotas,
            tasaAnual, moneda, vcto,
            fechaSimulacion, codigoUsuario } = SecondForm.getValues()

        let codigoUsuarioArray = codigoUsuario.split("")

        linea = Utils.formatAmount(linea)
        monto = Utils.formatAmount(monto)
        tasaAnual = Utils.formatAmount(tasaAnual)
        fechaSimulacion = Utils.formatDate(fechaSimulacion)
        codigoUsuario = `${codigoUsuarioArray[0]}${codigoUsuarioArray[1]}${codigoUsuarioArray[2]}xxx${codigoUsuarioArray[6]}`

        return {
            numeroSimulacion,
            linea,
            monto,
            cuotas,
            tasaAnual,
            moneda,
            vcto,
            fechaSimulacion,
            codigoUsuario,
            transactionType
        }
    },

    clearFields() {
        SecondForm.numeroSimulacion.value = ""
        SecondForm.linea.value = ""
        SecondForm.monto.value = ""
        SecondForm.cuotas.value = ""
        SecondForm.tasaAnual.value = ""
        SecondForm.moneda.value = ""
        SecondForm.vcto.value = ""
        SecondForm.fechaSimulacion.value = ""
        SecondForm.codigoUsuario.value = ""
    },

    submit(event) {
        event.preventDefault()
        try {
            localStorage.clear()
            SecondForm.validateFields()
            const transaction = SecondForm.formatValues()
            Transaction.add(transaction)
            SecondForm.clearFields()
            Modal.closeSecondModal()

        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        // Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    },
}



// App.init()