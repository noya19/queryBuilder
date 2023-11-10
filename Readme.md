# QueryBuilder

This repository contains code for a Postgres Query Builder. A queryBuilder means we don't have to write raw querries by ourselves but we only need to provide args to predefined functions such as select, from, where, groupBy and the `compile` method will contruct the query by itself.


This code can also be used to build queryBuilder for other SQL databases like MySQL, SQL Server,etc. Just create a new class and then extend the `AbstractQueryBuilder` class and write definition for the `compile` and `execute method`. 


