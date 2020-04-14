package org.openchs.web.request.rules.response;

import java.util.ArrayList;
import java.util.List;
public class DecisionResponse implements Decisions
{
    private String name;
    private List<String> value;

    public void setName(String name){
        this.name = name;
    }
    public String getName(){
        return this.name;
    }
    public void setValue(List<String> value){
        this.value = value;
    }
    public List<String> getValue(){
        return this.value;
    }
}