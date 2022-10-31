package org.avni.server.web.request.rules.constructWrappers;

import org.avni.server.domain.CHSEntity;
import org.avni.server.web.request.rules.RulesContractWrapper.RuleServerEntityContract;

public interface RuleServiceContractMapper<P extends CHSEntity, Q extends RuleServerEntityContract> {
    Q map(P chsEntity);
    boolean canMap(CHSEntity chsEntity);
}
