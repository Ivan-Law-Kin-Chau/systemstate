module.exports = class Assembly {
	constructor (database) {
		this.database = database;
	}
	
	delimit (input) {
		return input.split(`"`).join(`""`);
	}
	
	convert_boolean_to_sql (input) {
		if (input === null) {
			return "null";
		} else if (input === true) {
			return "true";
		} else if (input === false) {
			return "false";
		} else {
			throw "Conversion error: " + input;
		}
	}
	
	convert_sql_to_boolean (input) {
		if (input === null) {
			return null;
		} else if (input === 1) {
			return true;
		} else if (input === 0) {
			return false;
		} else {
			throw "Conversion error: " + input;
		}
	}
	
	async execute (command) {
		console.log(command);
		return eval(`(this.${command})`);
	}
	
	async query (sql, callback) {
		var database = this.database;
		return new Promise ((resolve, reject) => {
			database.all("PRAGMA foreign_keys=ON;", (error, rows) => {
				database.all(sql, (error, rows) => {
					if (error) {
						resolve(JSON.stringify({
							_success: false, 
							_type: "SQL Error", 
							_sql: sql, 
							_error: error.code
						}));
					} else {
						callback(rows, resolve);
					}
				});
			});
		});
	}
	
	async add_object (uuid) {
		var table = "object";
		var sql = `INSERT INTO "${table}" VALUES ("${this.delimit(uuid)}");`;
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async load_object (uuid) {
		var table = "object";
		var sql = `SELECT * FROM "${table}" WHERE uuid = "${this.delimit(uuid)}";`;
		return this.query(sql, (rows, resolve) => {
			if (rows.length === 0) {
				resolve(JSON.stringify({
					_success: false, 
					_type: "Systemstate Error", 
					_sql: sql, 
					_error: "Not found"
				}));
				return;
			}
			
			for (const row of rows) {
				var uuid = row["uuid"];
			}
			
			resolve(JSON.stringify({
				_uuid: uuid, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async save_object (uuid, uuidNew) {
		var table = "object";
		var sql = `UPDATE "${table}" SET uuid = "${this.delimit(uuidNew)}" WHERE uuid = "${this.delimit(uuid)}";`;
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuidNew, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async remove_object (uuid) {
		var table = "object";
		var sql = `DELETE FROM "${table}" WHERE uuid = "${this.delimit(uuid)}";`;
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async add_group (uuid, parent) {
		var table = "group";
		var sql = `INSERT INTO "${table}" VALUES ("${this.delimit(uuid)}", "${this.delimit(parent)}");`;
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_parent: parent, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async load_group (uuid, parent) {
		var table = "group";
		var sql = `SELECT * FROM "${table}" WHERE uuid = "${this.delimit(uuid)}" AND parent = "${this.delimit(parent)}";`;
		return this.query(sql, (rows, resolve) => {
			if (rows.length === 0) {
				resolve(JSON.stringify({
					_success: false, 
					_type: "Systemstate Error", 
					_sql: sql, 
					_error: "Not found"
				}));
				return;
			}
			
			for (const row of rows) {
				var uuid = row["uuid"];
				var parent = row["parent"];
			}
			
			resolve(JSON.stringify({
				_uuid: uuid, 
				_parent: parent, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async save_group (uuid, uuidNew, parent, parentNew) {
		var table = "group";
		var sql = `UPDATE "${table}" SET uuid = "${this.delimit(uuidNew)}", parent = "${this.delimit(parentNew)}" WHERE uuid = "${this.delimit(uuid)}" AND parent = "${this.delimit(parent)}";`;
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuidNew, 
				_parent: parentNew, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async remove_group (uuid, parent) {
		var table = "group";
		var sql = `DELETE FROM "${table}" WHERE uuid = "${this.delimit(uuid)}" AND parent = "${this.delimit(parent)}";`;
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_parent: parent, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async add_link (uuid, start, end, direction = null) {
		var table = "link";
		var sql = `INSERT INTO "${table}" VALUES ("${this.delimit(uuid)}", "${this.delimit(start)}", "${this.delimit(end)}", ${this.convert_boolean_to_sql(direction)});`;
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_start: start, 
				_end: end, 
				_direction: direction, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async load_link (uuid) {
		var table = "link";
		var sql = `SELECT * FROM "${table}" WHERE uuid = "${this.delimit(uuid)}";`;
		return this.query(sql, (rows, resolve) => {
			if (rows.length === 0) {
				resolve(JSON.stringify({
					_success: false, 
					_type: "Systemstate Error", 
					_sql: sql, 
					_error: "Not found"
				}));
				return;
			}
			
			for (const row of rows) {
				var uuid = row["uuid"];
				var start = row["start"];
				var end = row["end"];
				var direction = row["direction"];
			}
			
			resolve(JSON.stringify({
				_uuid: uuid, 
				_start: start, 
				_end: end, 
				_direction: this.convert_sql_to_boolean(direction), 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async save_link (uuid, uuidNew, start, end, direction = null) {
		var table = "link";
		var sql = `UPDATE "${table}" SET uuid = "${this.delimit(uuidNew)}", start = "${this.delimit(start)}", end = "${this.delimit(end)}", direction = ${this.convert_boolean_to_sql(direction)} WHERE uuid = "${this.delimit(uuid)}";`;
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuidNew, 
				_start: start, 
				_end: end, 
				_direction: direction, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async remove_link (uuid) {
		var table = "link";
		var sql = `DELETE FROM "${table}" WHERE uuid = "${this.delimit(uuid)}";`;
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async add_property (uuid, parent, name, content) {
		var table = "property";
		var sql = `INSERT INTO "${table}" VALUES ("${this.delimit(uuid)}", "${this.delimit(parent)}", "${this.delimit(name)}", "${this.delimit(content)}");`;
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_parent: parent, 
				_name: name, 
				_content: content, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async load_property (uuid) {
		var table = "property";
		var sql = `SELECT * FROM "${table}" WHERE uuid = "${this.delimit(uuid)}";`;
		return this.query(sql, (rows, resolve) => {
			if (rows.length === 0) {
				resolve(JSON.stringify({
					_success: false, 
					_type: "Systemstate Error", 
					_sql: sql, 
					_error: "Not found"
				}));
				return;
			}
			
			for (const row of rows) {
				var uuid = row["uuid"];
				var parent = row["parent"];
				var name = row["name"];
				var content = row["content"];
			}
			
			resolve(JSON.stringify({
				_uuid: uuid, 
				_parent: parent, 
				_name: name, 
				_content: content, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async save_property (uuid, uuidNew, parent, name, content) {
		var table = "property";
		var sql = `UPDATE "${table}" SET uuid = "${this.delimit(uuidNew)}", parent = "${this.delimit(parent)}", name = "${this.delimit(name)}", content = "${this.delimit(content)}" WHERE uuid = "${this.delimit(uuid)}";`;
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_parent: parent, 
				_name: name, 
				_content: content, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async remove_property (uuid) {
		var table = "property";
		var sql = `DELETE FROM "${table}" WHERE uuid = "${this.delimit(uuid)}";`;
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_success: true, 
				_type: "table", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	
	async search (attribute, value, table = "object") {
		if (table === "group") {
			var sql = `SELECT uuid, parent FROM "${table}" WHERE ${this.delimit(attribute)} LIKE "${this.delimit(value)}";`;
		} else {
			var sql = `SELECT uuid FROM "${table}" WHERE ${this.delimit(attribute)} LIKE "${this.delimit(value)}";`;
		}
		
		return this.query(sql, (rows, resolve) => {
			var output = [];
			for (const row of rows) {
				output[output.length] = {};
				for (const rowAttribute in row) {
					output[output.length - 1]["_" + rowAttribute] = row[rowAttribute];
				}
			}
			
			resolve(JSON.stringify({
				_output: output, 
				_success: true, 
				_type: "search", 
				_table: table, 
				_sql: sql
			}));
		});
	}
	
	async undefine () {
		var table = "object";
		var sql = [`SELECT uuid FROM "${table}";`];
		return this.query(sql[0], (rows, resolve) => {
			for (const row of rows) {
				var database = this.database;
				sql.push(`DELETE FROM ${table} WHERE uuid = "${this.delimit(row["uuid"])}";`);
				database.all(sql[sql.length - 1], (error, rows) => {});
			}
			
			resolve(JSON.stringify({
				_success: true, 
				_type: "undefine", 
				_table: table, 
				_sql: sql.join(" ")
			}));
		});
	}
}