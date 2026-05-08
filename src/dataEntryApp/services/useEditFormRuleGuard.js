import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "dataEntryApp/api";
import { mapForm } from "common/adapters";
import { runEditFormRule } from "dataEntryApp/services/RuleEvaluationService";

export const useEditFormRuleGuard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [editBlockedMessage, setEditBlockedMessage] = useState(null);
  const [pending, setPending] = useState(false);

  const attemptEdit = useCallback(
    async ({ formUuid, entity, entityType, navigateTo }) => {
      if (!formUuid) {
        navigate(navigateTo);
        return;
      }
      setPending(true);
      try {
        const formJson = await api.fetchForm(formUuid);
        const form = mapForm(formJson);
        const response = runEditFormRule(form, entity, entityType);
        if (response.isAllowed()) {
          navigate(navigateTo);
        } else {
          const message = response.getMessage();
          setEditBlockedMessage(message ? t(message) : t("editAccessDenied"));
        }
      } catch (e) {
        console.error("Edit form rule guard: failed to load form", e);
        navigate(navigateTo);
      } finally {
        setPending(false);
      }
    },
    [navigate, t],
  );

  const clearBlocked = useCallback(() => setEditBlockedMessage(null), []);

  return { attemptEdit, editBlockedMessage, clearBlocked, pending };
};
