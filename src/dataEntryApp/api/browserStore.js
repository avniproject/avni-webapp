import { Individual, ObservationsHolder, Observation,Concept } from "avni-models";

export default class {
  static fetchSubject() {
    if(sessionStorage.getItem('subject')){                           
      let subject = Individual.createEmptyInstance();      
      let localSavedSubject =JSON.parse(sessionStorage.getItem('subject'));    
      localSavedSubject.uuid = subject.uuid;     
                     

      subject.name = localSavedSubject.name
      subject.firstName = localSavedSubject.firstName 
      subject.lastName = localSavedSubject.lastName 
      subject.dateOfBirth =  localSavedSubject.dateOfBirth 
      subject.registrationDate  = localSavedSubject.registrationDate 
      subject.dateOfBirthVerified = localSavedSubject.dateOfBirthVerified 
      subject.gender.name = localSavedSubject.gender.name
      subject.gender.uuid = localSavedSubject.gender.uuid
      subject.lowestAddressLevel = localSavedSubject.lowestAddressLevel      
      subject.registrationLocation = localSavedSubject.registrationLocation 
      subject.relationship = localSavedSubject.relationship 
      subject.subjectType.name = localSavedSubject.subjectType.name    
      subject.subjectType.uuid = localSavedSubject.subjectType.uuid 
      
      
      
      //addOrUpdateObservation
      
      const obs = [];              
      localSavedSubject.observations.map(element =>{        
          let concept = Concept.create(element.concept.name, element.concept.dataType, element.concept.keyValues, element.concept.uuid)                   
          obs.push(Observation.create(concept,element.valueJSON,element.abnormal));        
      })
      subject.observations = obs;
      return subject;  
    }else return;
  }

  static clear(key) {
    if(sessionStorage.getItem(key)) {
      sessionStorage.clear(key);
    }
  }
}
