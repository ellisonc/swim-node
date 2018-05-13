from selenium import webdriver
import re
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import DesiredCapabilities
from bs4 import BeautifulSoup
import time
import json
import sys



#**************************************************************************************************
# submitForm
#
# submit the initial form to usaswimming
#
#**************************************************************************************************
def submitForm(firstName, lastName, driver):
    try:
        fname_field = driver.find_element_by_name('FirstName')
        lname_field = driver.find_element_by_name('LastName')
        startDate = driver.find_element_by_name('UsasTimeSearchIndividual_Index_Div_1StartDate')
        endDate = driver.find_element_by_name('UsasTimeSearchIndividual_Index_Div_1EndDate')
        submit  = driver.find_element_by_id('UsasTimeSearchIndividual_Index_Div_1-saveButton')

        fname_field.send_keys(firstName)
        lname_field.send_keys(lastName)

        submit.click()
    except:
        print("err")



#**************************************************************************************************
# scrapeAndSave
#
# Perform the actual time scraping
#
#**************************************************************************************************
def scrapeAndSave(driver):
    pageNum = 1
    try:
        numPages = int(driver.find_element_by_id("UsasTimeSearchIndividual_TimeResults_Grid-1-UsasGridPager-lblTotalPages").text)
        nxtPageBtn = driver.find_element_by_id("UsasTimeSearchIndividual_TimeResults_Grid-1-UsasGridPager-pgNext")
        browserPgNum = driver.find_element_by_id("UsasTimeSearchIndividual_TimeResults_Grid-1-UsasGridPager-txtCurrentPage")
    except:
        print("err")
    while(pageNum <= numPages):
        bsObj = BeautifulSoup(driver.page_source, "lxml")
        #parse table
        eventTable = bsObj.find("div", {"class":"k-grid-content-locked"}).table.tbody.contents
        dataTable = bsObj.find("tbody", {'role':'rowgroup'}).contents
        i = 0
        for event in eventTable:
            print(event.td.string, end='\t')
            dataRow = dataTable[i]
            i += 1
            for entry in dataRow:
                print(entry.string, end='\t')
            print('')

        pageNum += 1
        if(pageNum <= numPages):
            nxtPageBtn.click()
            #wait for update
            for i in range(50):
                try:
                    current = int(browserPgNum.get_attribute('value'))
                except:
                    None

                if(current == pageNum):
                    break

                if(i == 49):
                    print("err")
                else:
                    time.sleep(0.1)


#**************************************************************************************************
# getTimes
#
# Retrieve times from usaswimming database based on name only
#
#**************************************************************************************************
def getTimes(firstName, lastName):
    success = False
    header = DesiredCapabilities.PHANTOMJS.copy()
    header['phantomjs.page.customHeaders.User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) ' \
                                                                  'AppleWebKit/537.36 (KHTML, like Gecko) ' \
                                                                  'Chrome/39.0.2171.95 Safari/537.36'
    driver = webdriver.PhantomJS(executable_path='C:\Phantom\phantomjs.exe', desired_capabilities=header)
    #driver = webdriver.Chrome(executable_path="C:\Chrome\chromedriver.exe")
    driver.get("https://www.usaswimming.org/Home/times/individual-times-search")

    #Submit the initial form
    submitForm(firstName, lastName, driver)

    time.sleep(1)   #wait for the response
    pageSource = driver.page_source
    bsObj = BeautifulSoup(pageSource, "lxml")

    clubTable = None
    try:
        clubTable = driver.find_element_by_id("UsasTimeSearchIndividual_PersonSearchResults_Grid-1")
    except:
        None

    if(clubTable is not None):
        success = False
    else:
        success = scrapeAndSave(driver)

    driver.close()
    return success
#End getTimes


#**************************************************************************************************
# getTimes_club
#
# Retrieve times from the usaswimming database based on name and team
#
#**************************************************************************************************
def getTimes_club(firstName, lastName, clubID):
    header = DesiredCapabilities.PHANTOMJS.copy()
    header['phantomjs.page.customHeaders.User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) ' \
                                                                  'AppleWebKit/537.36 (KHTML, like Gecko) ' \
                                                                  'Chrome/39.0.2171.95 Safari/537.36'
    driver = webdriver.PhantomJS(executable_path='C:\Phantom\phantomjs.exe', desired_capabilities=header)
    #driver = webdriver.Chrome(executable_path="C:\Chrome\chromedriver.exe")
    driver.get("https://www.usaswimming.org/Home/times/individual-times-search")

    #submit the initial form
    submitForm(firstName, lastName, driver)

    time.sleep(1)

    try:
        links = driver.find_elements_by_class_name('pointer')
    except:
        print("err")

    if(len(links) <= clubID):
        print("err")

    links[clubID].click()

    time.sleep(1)

    #get and store time information
    try:
        scrapeAndSave(driver)
    except:
        print("err")

    driver.close()
#End getTimes


#**************************************************************************************************
# Main - get time data given a name and club id
#
#**************************************************************************************************

firstname = sys.argv[1]
lastname = sys.argv[2]
success = getTimes(firstname, lastname)
if(len(sys.argv) >= 4):
    clubID = sys.argv[3]
    getTimes_club(firstname, lastname, int(clubID))
sys.stdout.flush()
exit