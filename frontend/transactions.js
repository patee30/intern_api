export async function GetTransaction (access_token_endpoint, access_token, transIDRecords, id_transField) {
    const recordUpdates = []
    for (record in transIDRecords) {
        const recordUpdates = [];
        const request = {
            method: 'GET',
            headers: { 'Authorization': access_token},
        };

        const response = await fetch(`${access_token_endpoint}/v1/transactions`, request);

        const data_rep = await response.json();

        for (i in data_rep.data.records) {
            for (j in transIDRecords) {
                if (i.id != j.getCellValueAsString(id_transField)) {
                    recordUpdates.push(
                        id = record.id
                    )
                }
            }
        }
    }

}