import sqlite3

cocursor=""
connect=""

def Connect():
    global cocursor,connect
    connect = sqlite3.connect('qt.db')
    print("Opened database successfully")
    cocursor = connect.cursor()

    
def Close():
    global connect
    connect.close() 

  
def INSERT(sql):
    global cocursor,connect
    Connect()
    cocursor.execute(sql);
    print ('INSERT successfully')
    connect.commit()

    
def UPDATE(sql):
    global cocursor,connect
    Connect()
    cocursor.execute(sql);
    print ('UPDATE successfully')
    connect.commit()
  
  
def SELECT(sql):
    global cocursor,connect
    Connect()
    data=cocursor.execute(sql) 
    return data
  

def CreateTable(sql):
    global cocursor
    Connect()
    cocursor.execute(sql)
    print ('Table created successfully')
    Close()
 
  