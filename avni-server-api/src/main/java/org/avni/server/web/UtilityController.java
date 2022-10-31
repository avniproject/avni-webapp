package org.avni.server.web;

import org.avni.server.application.Form;
import org.avni.server.application.FormElement;
import org.avni.server.dao.application.FormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class UtilityController {
    private FormRepository formRepository;
    private final Invocable invocable;

    @Autowired
    public UtilityController(FormRepository formRepository) throws IOException, ScriptException {
        this.formRepository = formRepository;
        Reader camelCaseFile = new InputStreamReader(new ClassPathResource("/js/camelCase.js").getInputStream());
        ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
        engine.eval(camelCaseFile);
        invocable = (Invocable) engine;
    }

    @RequestMapping(value = "/util/formElementHandlerNames", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public List<String> formElementHandlerNames(@RequestParam(value = "formUUID") String formUUID) {
        Form form = formRepository.findByUuid(formUUID);
        return form.getAllFormElements().stream()
                .map(FormElement::getName)
                .map((String str) -> {
                    try {
                        return (String) invocable.invokeFunction("camelCase", str);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    return "";
                })
                .collect(Collectors.toList());
    }
}
