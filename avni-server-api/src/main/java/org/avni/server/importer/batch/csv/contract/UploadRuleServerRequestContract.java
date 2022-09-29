package org.avni.server.importer.batch.csv.contract;

import org.avni.server.application.Form;
import org.avni.server.importer.batch.model.Row;
import org.avni.server.web.request.application.FormContract;

public class UploadRuleServerRequestContract {
    private Row row;
    private FormContract form;
    private Object entity;

    public static UploadRuleServerRequestContract buildRuleServerContract(Row row, Form form, Object entity) {
        UploadRuleServerRequestContract contract = new UploadRuleServerRequestContract();
        contract.setRow(row);
        contract.setForm(FormContract.fromForm(form));
        contract.setEntity(entity);
        return contract;
    }

    public Row getRow() {
        return row;
    }

    public void setRow(Row row) {
        this.row = row;
    }

    public FormContract getForm() {
        return form;
    }

    public void setForm(FormContract form) {
        this.form = form;
    }

    public Object getEntity() {
        return entity;
    }

    public void setEntity(Object entity) {
        this.entity = entity;
    }
}
