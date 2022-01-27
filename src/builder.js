
export default ({ format }) => (expression = {}) => {
  
  const state = {
    sql: [],
    values: [],
  }
  
  const operators = {
    $select: (table) => {
      if(expression.$columns) {
        return ['SELECT ?? FROM ??', [expression.$columns, table]]
      }

      return ['SELECT * FROM ??', [table]]
    },
    $insert: (table) => {
      let sql, columns, values

      if(expression.$value) {
        sql = 'INSERT INTO ?? (??) VALUES (?)'
        columns = Object.keys(expression.$value)
        values = Object.values(expression.$value)
      }
      if(expression.$values) {
        sql = 'INSERT INTO ?? (??) VALUES ?'
        columns = Object.keys(expression.$values[0])
        values = expression.$values.map(value => Object.values(value))
      }
      if(expression.$columns) {
        columns = expression.$columns
      }
      
      return [sql, [table, columns, values]]
    },
    $update: (table) => {
      let sql, set

      if(expression.$set) {
        sql = 'UPDATE ?? SET ?'
        set = expression.$set
      }

      return [sql, [table, set]]
    },
    $delete: (table) => {
      return ['DELETE FROM ??', [table]]
    },
    $where: () => {
      return []
    },
    $limit: (value) => {
      let sql, values

      sql = 'LIMIT ?'
      values = [value]

      if(expression.$offset) {
        sql = 'LIMIT ? OFFSET ?'
        values.push(expression.$offset)
      }
      
      return [sql, values]
    },
    $order: (order) => {

      const order_object = ({ by, sort }) => {
        let sql, values = []
        if(by) {
          sql = 'ORDER BY ??'
          values.push(by)
          if(order.sort) {
            sort = sort.toLowerCase()
            if(['asc', 'ascending'].includes(sort)) {
              sql = 'ORDER BY ?? ASC'
            }
            if(['desc', 'descending'].includes(sort)) {
              sql = 'ORDER BY ?? DESC'
            }
          }
        }
        return [sql, values]
      }

      const order_string = (by) => {
        return ['ORDER BY ??', [by]]
      }
      
      switch (typeof order) {
        case 'object':
          return order_object(order)
        default:
          return order_string(order)
      }
    }
  }

  const add = ([sql, values] = []) => {
    if(sql) state.sql.push(sql)
    if(values) state.values.push(...values)
  }

  const build = (expression) => {
    const operations = Object.entries(expression)

    operations.forEach(([operation, value]) => {
      if(operators[operation]) {
        add(operators[operation](value))
      }
    })
    
    return format(state.sql.join(' '), state.values)
  }

  return build(expression)
}