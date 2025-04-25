 Contact Registry Web App & APIs
Stack:
Frontend – Vue.js
Backend – Node.js (Express)
Database – MySQL

Description:
A contact management system that allows users to create and manage contact records and provides both REST and SOAP APIs for external systems to query the data.

Features:

Data Fields Collected:

Full Name

Phone Number (MSIN)

Email Address

ID Number

Date of Birth

Gender

Organization

Automatically Generated Fields:

Masked Name – e.g., "John" → "J***"

Masked Phone Number – e.g., "254711123118" → "254711***118"

Hashed Phone Number – SHA-256 hash of the raw phone number

CRUD Functionality:

Create, Read, Update, Delete contacts via the web interface and REST API

API Endpoints:

REST API – For all standard CRUD operations

SOAP API – Query contact data for a given organization name (returns matching contacts)
