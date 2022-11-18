import sys
import os
from web3 import Web3, HTTPProvider,IPCProvider
from web3.contract import ConciseContract
from web3.eth import Eth
import requests
import abi
from web3.auto import w3


ETH_URL = os.environ.get('ETHURL')
web3 = Web3(HTTPProvider(ETH_URL))

contract_instance = web3.eth.contract(address=os.environ.get('contract_ADDR'), abi=abi.abi)

MY_ADDR =  os.environ.get('ADDR')
PRIV_KEY = os.environ.get('PRIV_KEY')


def SendTxn(txn):
  
    signed_txn = web3.eth.account.signTransaction(txn, private_key=PRIV_KEY)
    res = web3.eth.sendRawTransaction(signed_txn.rawTransaction).hex()
    txn_receipt = web3.eth.waitForTransactionReceipt(res)
    
    return signed_txn

def send():
  
    txn = contract_instance.functions.functions(1).buildTransaction(
        {
        'chainId': 1,
        'nonce': web3.eth.getTransactionCount(MY_ADDR),
        'gas': 3000000,
        'value':Web3.toWei(0,'ether'),
        'gasPrice': web3.eth.gasPrice,
        }
    )
    signed=SendTxn(txn)
    
    return signed
    
