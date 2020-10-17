'use strict'

import { setupGlobalUniverse } from '../core/universe.js'

import './damageTests.js'
import './tileTests.js'
import './creatureTests.js'
import './worldTests.js'
import './movementTests.js'
import './mutationTests.js'

setupGlobalUniverse()

mocha.run()
