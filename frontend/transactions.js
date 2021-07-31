const MAX_RECORDS_PER_UPDATE = 50;

export async function GetTransaction(access_token_endpoint, access_token, transactionsTable, transIDRecords, 
    ID_TRANS_FIELD, DATE_FIELD, AMOUNT_FIELD, DESCRIPTION_FIELD, fromDate, page, pageSize) {
    const recordUpdates = []
    const request = {
        method: 'GET',
        headers: { 'Authorization': access_token},
    };

    const response = await fetch(`${access_token_endpoint}/v1/transactions?fromDate=${fromDate}&page=${page}&pageSize=${pageSize}&sort=DESC`, request);

    const data_rep = await response.json();
    
    if (transIDRecords.length == 0) 
    {
        for (const record of data_rep.data.records)
        {
            recordUpdates.push(
                {    
                    fields: 
                    {
                        [ID_TRANS_FIELD]: record.id.toString(),
                        [DATE_FIELD]: ChangeFormateDate(record.when.toString()),
                        [AMOUNT_FIELD]: numberWithCommas(record.amount.toString()),
                        [DESCRIPTION_FIELD]: record.description.toString()
                    }
                }
            )
        }
    }
    else {
        for (const record of data_rep.data.records) {
            if (transIDRecords.includes(record.id) == false) {
                recordUpdates.push(
                    {    
                        fields: 
                        {
                            [ID_TRANS_FIELD]: record.id.toString(),
                            [DATE_FIELD]: ChangeFormateDate(record.when.toString()),
                            [AMOUNT_FIELD]: numberWithCommas(record.amount.toString()),
                            [DESCRIPTION_FIELD]: record.description.toString()
                        }
                    }
                )
            }
        }
    }

    await createRecords(transactionsTable, recordUpdates);
    
    await delayAsync(50);
}

async function createRecords(table, recordUpdates) {
    let i = 0;
    while (i < recordUpdates.length) {
        const updateBatch = recordUpdates.slice(i, i + MAX_RECORDS_PER_UPDATE);
        await table.createRecordsAsync(updateBatch);
        i += MAX_RECORDS_PER_UPDATE;
    }
}

function delayAsync(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function ChangeFormateDate(oldDate)
{
   return oldDate.toString().split("/").reverse().join("/");
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}