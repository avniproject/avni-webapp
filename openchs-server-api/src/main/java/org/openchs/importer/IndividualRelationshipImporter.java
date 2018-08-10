package org.openchs.importer;

import org.apache.poi.ss.usermodel.Row;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.dao.individualRelationship.IndividualRelationshipTypeRepository;
import org.openchs.domain.individualRelationship.IndividualRelationshipType;
import org.openchs.excel.ImportSheetHeader;
import org.openchs.excel.metadata.ImportAnswerMetaDataList;
import org.openchs.excel.metadata.ImportField;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.web.IndividualRelationshipController;
import org.openchs.web.request.IndividualRelationshipRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.function.Consumer;

@Component
public class IndividualRelationshipImporter extends Importer<IndividualRelationshipRequest> {

    private final IndividualRelationshipTypeRepository individualRelationshipTypeRepository;
    private final IndividualRelationshipController individualRelationshipController;

    @Autowired
    public IndividualRelationshipImporter(ConceptRepository conceptRepository, FormElementRepository formElementRepository, IndividualRelationshipTypeRepository individualRelationshipTypeRepository, IndividualRelationshipController individualRelationshipController) {
        super(conceptRepository, formElementRepository);
        this.individualRelationshipTypeRepository = individualRelationshipTypeRepository;
        this.individualRelationshipController = individualRelationshipController;
    }

    @Override
    protected Boolean processRequest(IndividualRelationshipRequest entityRequest) {
        individualRelationshipController.save(entityRequest);
        return true;
    }

    @Override
    protected IndividualRelationshipRequest makeRequest(List<ImportField> importFields, ImportSheetHeader header, ImportSheetMetaData importSheetMetaData, Row row, ImportAnswerMetaDataList answerMetaDataList) {
        IndividualRelationshipRequest individualRelationshipRequest = new IndividualRelationshipRequest();
        HashMap<String, Consumer<String>> propSetters = new HashMap<String, Consumer<String>>() {{
            put("IndividualAUUID", individualRelationshipRequest::setIndividualAUUID);
            put("IndividualBUUID", individualRelationshipRequest::setIndividualBUUID);
            put("RelationshipType", (name) -> {
                IndividualRelationshipType relationshipType = individualRelationshipTypeRepository.findByName(name);
                if (relationshipType != null) {
                    individualRelationshipRequest.setRelationshipTypeUUID(relationshipType.getUuid());
                } else {
                    throw new IllegalArgumentException(String.format("Invalid relationship type '%s'.", name));
                }
            });
        }};
        for (ImportField importField : importFields) {
            String fieldName = importField.getSystemFieldName();
            String value = importField.getTextValue(row, header, importSheetMetaData);
            Consumer<String> setter = propSetters.get(fieldName);
            if (setter != null) {
                setter.accept(value);
            } else {
                System.out.println(String.format("Field '%s' not recognised.", fieldName));
            }
        }
        individualRelationshipRequest.setupUuidIfNeeded();
        return individualRelationshipRequest;
    }
}
