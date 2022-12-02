import Db.db as db
from werkzeug.security import generate_password_hash, check_password_hash
import time


class Member():    
        
    def register(self,account,password):
        sql="INSERT INTO Register (Account,Password) \
      VALUES ('"+account+"', '"+password+"')" 
        db.INSERT(sql)
   
    
    def createStrategy(self,account,strategyName):
        password = account+strategyName+str(time.ctime())
        strategyToken = generate_password_hash(password=password).split('$')[2]
        sql="INSERT INTO Strategy (Account,StrategyName,StrategyToken,Contract) \
      VALUES ('"+account+"','"+strategyName+"','"+str(strategyToken)+"', '"+""+"')" 
        db.INSERT(sql)
        return str(strategyToken)

        
    def setContract(self,strategyToken,contract):
        sql="UPDATE Strategy SET Contract='"+contract+"' where StrategyToken='"+strategyToken+"'" 
        db.UPDATE(sql)
      
      
    def SelectStrategy(self):
        sql="SELECT * from Strategy" 
        data=db.SELECT(sql)
        return data
      
      
    def getContractAddress(self,token):
      
        sql="SELECT Contract from Strategy where StrategyToken='"+token+"'" 
        print(sql)
        data=db.SELECT(sql)
        return data
       