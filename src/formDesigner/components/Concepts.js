import React, { Component } from 'react';
import MaterialTable from 'material-table';
import ButtonAppBar from './CommonHeader';
import axios from 'axios';

class Concepts extends Component {
  constructor(){
    super();
    this.state={
      columns: [
        { title: 'Name', field: 'name' },
        { title: 'DataType', field: 'dataType' },
        { title: 'UUID', field: 'uuid', type: 'numeric' },
      ],
      finalData : []
    }
  }

  componentDidMount(){
    axios
    .get("/concept?size=10")
    .then((response)=>{
        const result = response.data._embedded.concept;
        const data1 = [];
        console.log("Component Did Mount",result)
       

        this.setState({
          data:data1,
          totalCount : response.data.page.totalElements
        })
    })
    .catch((error) =>{
        console.log(error)
    });
  }

  render() {
    return (      
      <div>
        <ButtonAppBar title="Concepts List"/>
        <MaterialTable
          title=''
          columns={this.state.columns}
          
          data={query =>
            new Promise((resolve, reject) => {
              const filteredVoided = [];
              let url = '/concept?'
              url += 'size=' + query.pageSize
              url += '&page=' + (query.page + 1)
              fetch(url)
                .then(response => response.json())
                .then(result => {

                  for (var i=0;i<result._embedded.concept.length;i++){

                    // Handling voided true concepts below. Once API starts returning data with voided false then we can remove if statement.
                    if(!result._embedded.concept[i].voided){
                      filteredVoided.push({name: result._embedded.concept[i].name, dataType:result._embedded.concept[i].dataType, uuid:result._embedded.concept[i].uuid })
                    }
                }
                this.setState({
                  finalData : filteredVoided,
                })
                  resolve({
                    data: this.state.finalData,
                    page: result.page.number - 1,
                    totalCount: result.page.totalElements,
                  })
                })
            })
          }
          
          options ={{
            pageSize : 10,
            pageSizeOptions :[10, 15, 20],
            addRowPosition : 'first',
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
                const data = this.state.finalData
                setTimeout(() => {
                  
                  axios
                  .post('/concepts',[{
                    uuid: oldData.uuid,
                    voided: true,
                    }
                    ])
                  .then(function (response) {
                    console.log(response)
                    if(response.status===200){
                      for (var i=0;i<data.length;i++){
                        if(data[i].uuid===oldData.uuid){
                            data.splice(i,1)
                        }
                      }
                      resolve({
                        data: data
                      });

                    }
                        
                    })
                  .catch(function (error) {
                        console.log(error);
                  });
                }, 600);
                
              }),
          }}
        />
      </div>
    );
  }
}

export default Concepts;