import json
from flask import Flask, request, abort, jsonify
from flask_restful import Api, Resource
from flask_cors import CORS
import os
import data
import contract


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
        if str(data).count('option')<1:
            return jsonify({'Missing keywords': "option" })
        else:
            return None


class apiCollect(Resource):    
    
    def __init__(self):
      self.verify=ApiVerify()

      
    def get(self):
      
          
        # data = request.args.get('USDT')
        return jsonify({'USDT': "3000.0"})
     
    
    def post(self):       
          
        data = request.get_json()       
        
        if self.verify.postData(data)!=None:
            return self.verify.postData(data)
             
          
        for i in data:
            try:
              item ={'Option':i['Option'],"Description":i['Description'],'Position':i['Position']}
            except:
              print()       

        return item, 201
      
      
api.add_resource(apiCollect, '/api/swap')


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)