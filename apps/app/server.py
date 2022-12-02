import json
from flask import Flask, request, abort, jsonify
from flask_restful import Api, Resource
from flask_cors import CORS
import os
import Contract.contract as contract
import Authority.register as register


app = Flask(__name__)
api = Api(app)

CORS(app)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

apiKey=os.environ.get("SECRET")


class ApiVerify():
  
    def xapikey(self):
        if "X-Api-Key" in request.headers.keys():
            return request.headers.get("X-Api-Key")
        else:
            return None
        
        
    def postData(self,data):
        if str(data).count('Option')<1:
            return jsonify({'Missing keywords': "Option" })
        else:
            return None


class Swap(Resource):    
    
    def __init__(self):
        self.verify=ApiVerify()
        self.authority=register.Member()
        self.swap=contract.callContract()   


    def get(self):      
        return jsonify({'message': "This api is only post"})
     
    
    def post(self):       
          
        data = request.get_json()       
        
        if self.verify.postData(data)!=None:
            return self.verify.postData(data)       
        
        for row in self.authority.getContractAddress(data['Token']):
            address=row[0]     
        
        try: 
            if data['Option']=='Open':
                self.swap.open(data['Proportion'],data['Price'],address)
            else:
                self.swap.close(data['Proportion'],data['Price'],address)
        except Exception as e:
            return jsonify({'Error': str(e)}) 
                  
        return jsonify({'Success': "Swap"})

      
class Register(Resource):    
    
    def __init__(self):
        self.verify=ApiVerify()            
        self.authority=register.Member()

             
    def get(self):
        return jsonify({'message': "This api is only post"})
     
    
    def post(self):       
        data = request.get_json()       

        try:
            self.authority.register(data['Account'],data['Password'])
        except Exception as e:
            return jsonify({'Error': str(e)})     
              
        return jsonify({'Success': "Register"}) 

      
class CreateStrategy(Resource):    
    
    def __init__(self):
        self.verify=ApiVerify()            
        self.authority=register.Member()

          
    def get(self):
        return jsonify({'message': "This api is only post"})

     
    def post(self):             
        data = request.get_json()       

        try:
            token=self.authority.createStrategy(data['Account'],data['StrategyName'])
        except Exception as e:
            return jsonify({'Error': str(e)}) 

        return jsonify({'Token': token})    
      
      
class SetContract(Resource):    
    
    def __init__(self):
        self.verify=ApiVerify()            
        self.authority=register.Member()
      
      
    def get(self):
        return jsonify({'Message': "This api is only post"})
     
    
    def post(self):             
        data = request.get_json()                 
       
        try:
            self.authority.setContract(data['Token'],data['Contract'])
        except Exception as e:
            jsonify({'Error': str(e)})        

        return jsonify({'Success': "Set contract"})   

      
      
api.add_resource(Swap, '/api/swap')
api.add_resource(Register, '/api/register')
api.add_resource(CreateStrategy, '/api/createStrategy')
api.add_resource(SetContract, '/api/setContract')

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)