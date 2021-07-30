import React from 'react';

export async function GetUserInfo(access_token, infoRecords, access_token_endpoint, NAME_FIELD, EMAIL_FIELD) {
    const recordUpdates = [];
    
    for (const record of infoRecords) {
        const request = {
            method: 'GET',
            headers: { 'Authorization': access_token },
        };
    
        const response = await fetch(`${access_token_endpoint}/v1/userInfo`, request);
    
        const data_rep = await response.json();
        

        recordUpdates.push(
            {
                id: record.id,
                fields:
                    {
                        [EMAIL_FIELD]: data_rep.data.user.email,
                        [NAME_FIELD]: data_rep.data.business.name,
                    },
            }
        );
        // await delayAsync(10);
    }
    return recordUpdates;
}