import React, { useState } from "react";
import http from "common/utils/httpClient";
import Chip from "@material-ui/core/Chip";
import FormLabel from "@material-ui/core/FormLabel";
import { default as UUID } from "uuid";
import AutoSuggestForEntity from "./AutoSuggestForEntity";

function EncounterTypeChips(props) {
  const encounterTypeObject = {};
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  props.encounterType.map(l => (encounterTypeObject[l.uuid] = l));

  const temp = props.formMapping.filter(
    l => l.subjectTypeUUID === props.rowDetails.uuid && l.encounterTypeUUID !== null
  );

  const removeDuplicate = [...new Set(temp.map(t => t.encounterTypeUUID))];

  const onAddEncounterType = (flag, t) => {
    if (name.trim() !== "") {
      const data = {
        uuid: UUID.v4(),
        subjectTypeUUID: props.rowDetails.uuid,
        encounterTypeUUID: ""
      };
      if (flag) {
        http
          .post("/web/encounterType", {
            name: name
          })
          .then(response => {
            if (response.status === 200) {
              setError("");
              props.setEncounterType([...props.encounterType, response.data]);
              data.encounterTypeUUID = response.data.uuid;
              http
                .post("/emptyFormMapping", data)
                .then(response => {
                  props.setMapping([...props.formMapping, data]);
                })
                .catch(error => {
                  console.log(error.response.data.message);
                });
            }
          })
          .catch(error => {
            setError(error.response.data.message);
          });
      }
      if (!flag) {
        const encounterUUID = props.encounterType.filter(l => l.name === t);
        data.encounterTypeUUID = encounterUUID[0].uuid;
        http
          .post("/emptyFormMapping", data)
          .then(response => {
            props.setMapping([...props.formMapping, data]);
          })
          .catch(error => {
            console.log(error.response.data.message);
          });
      }

      setError("");
      setName("");
    } else {
      setError("Please enter program name");
    }
  };

  return (
    <>
      {removeDuplicate.map((encounter, index) => {
        return (
          encounterTypeObject[encounter] && (
            <Chip
              size="small"
              label={encounterTypeObject[encounter].name}
              color="primary"
              key={index}
              // onDelete={()=> onRemoveProgram(index)}
            />
          )
        );
      })}
      <p />
      <AutoSuggestForEntity
        entity={props.encounterType}
        removeDuplicate={removeDuplicate}
        name={name}
        setName={setName}
        onAdd={onAddEncounterType}
        placeholder="Enter encounter type name"
        buttonName="Create encounter type"
      />

      <p />
      {error !== "" && (
        <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
          {error}
        </FormLabel>
      )}
    </>
  );
}

// function EncounterTypeChips(props){
//     const encounterTypeObject = {};
//     const [name, setName] = useState("");
//     const [error, setError] = useState("");

//     props.encounterType.map(l => (encounterTypeObject[l.uuid] = l));
//     const temp = props.formMapping.filter(
//       l => l.subjectTypeUUID === props.rowDetails.uuid && l.encounterTypeUUID !== null
//     );

//     const removeDuplicate = [...new Set(temp.map(t => t.encounterTypeUUID))];

//     const onAddEncounterType = () => {
//       if (name.trim() !== "") {
//         http
//           .post("/web/encounterType", {
//             name: name,
//           })
//           .then(response => {
//             if (response.status === 200) {
//               setError("");
//               props.setEncounterType([...props.encounterType, response.data]);
//               const data={
//                 uuid:UUID.v4(),
//                 subjectTypeUUID: props.rowDetails.uuid,
//                 encounterTypeUUID: response.data.uuid
//               };
//               http
//               .post("/emptyFormMapping",data)
//               .then(response=>{
//                 props.setMapping([...props.formMapping, data])
//               })
//               .catch(error=>{
//                 console.log(error.response.data.message);
//               })

//             }
//           })
//           .catch(error => {
//             setError(error.response.data.message);
//           });
//         setError("");
//         setName("");
//       } else {
//         setError("Please enter encounter type name");
//       }
//     };

//     return (
//       <>
//         <div>
//           {removeDuplicate.map((encounter, index) => {
//             return  (
//                 encounterTypeObject[encounter] &&
//               <Chip
//                 size="small"
//                 label={encounterTypeObject[encounter].name}
//                 color="primary"
//                 key={index}
//               />
//             );
//           })}
//         </div>
//         <TextField
//           label="Encounter type name"
//           value={name}
//           onChange={event => setName(event.target.value)}
//         />
//         <p />
//         {error !== "" && (
//           <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
//             {error}
//           </FormLabel>
//         )}
//         <p />
//         <Button color="primary" onClick={() => onAddEncounterType()}>
//           Add encounter type
//         </Button>
//       </>
//     );
//   };

export default React.memo(EncounterTypeChips);
