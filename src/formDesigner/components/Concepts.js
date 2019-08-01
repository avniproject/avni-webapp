import React, { Component } from "react";
import MaterialTable from "material-table";
import ButtonAppBar from "./CommonHeader";
import axios from "axios";

class Concepts extends Component {
  constructor() {
    super();
    this.state = {
      columns: [
        { title: "Name", field: "name" },
        { title: "DataType", field: "dataType" },
        { title: "UUID", field: "uuid", type: "numeric" }
      ],
      data: []
    };
  }

  componentDidMount() {
    axios
      .get("/concept?size=1000") //Need to change API here to get user specific concepts
      .then(response => {
        console.log(response);
        const concepts = response.data._embedded.concept;
        const nonVoidedConcepts = concepts.filter(
          concept => !concept["voided"]
        );

        this.setState({
          data: nonVoidedConcepts
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <div>
        <ButtonAppBar title="Concepts List" />
        <MaterialTable
          title=""
          columns={this.state.columns}
          data={this.state.data}
          options={{
            pageSize: 10,
            pageSizeOptions: [10, 15, 20],
            addRowPosition: "first"
          }}
          editable={{
            // onRowAdd: newData =>
            //   new Promise(resolve => {
            //     setTimeout(() => {
            //       resolve();
            //       const data = [...this.state.data];
            //       data.push(newData);
            //       this.setState({ ...this.state, data });
            //     }, 600);
            //   }),
            // onRowUpdate: (newData, oldData) =>
            //   new Promise(resolve => {
            //     setTimeout(() => {
            //       resolve();
            //       const data = [...this.state.data];
            //       data[data.indexOf(oldData)] = newData;
            //       this.setState({ ...this.state, data });
            //     }, 600);
            //   }),
            onRowDelete: oldData =>
              new Promise(resolve => {
                setTimeout(() => {
                  resolve();
                  axios
                    .post("/concepts", [
                      {
                        uuid: oldData.uuid,
                        voided: true
                      }
                    ])
                    .then(response => {
                      console.log(response);
                      if (response.status === 200) {
                        const data = [...this.state.data];
                        data.splice(data.indexOf(oldData), 1);
                        this.setState({ ...this.state, data });
                      }
                    }, 600);
                });
              })
          }}
        />
      </div>
    );
  }
}

export default Concepts;
