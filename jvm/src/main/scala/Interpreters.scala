package scalaworld.interpreters

/*
This file shows a simple language, an interpreter, and two
partial evaluators for that language, along with a profiling suite.
*/

trait Expr // denotes a Vector[Double] => Vector[Double]

object Expr {
  /** Set register `d` (for "destination") equal to `n`. */
  case class Num(d: Int, n: Double) extends Expr
  /** Set register `d` equal to register `i` + register `j`. */
  case class Plus(d: Int, i: Int, j: Int) extends Expr
  /** Decrement register `d`. */
  case class Decr(d: Int) extends Expr
  /** Set register `d` equal to register `i`. */
  case class Copy(d: Int, i: Int) extends Expr
  /** Run the instructions in `es` in sequence. */
  case class Block(es: List[Expr]) extends Expr
  /** Execute `p` repeatedly until the `haltIf0` register is 0. */
  case class Loop(haltIf0: Int, p: Expr) extends Expr

  /** Some syntax - variadic `Block.apply`. */
  object Block { def apply(es: Expr*): Expr = Block(es.toList) }

  /**
   * A simple interpreter for `Expr`. For efficiency, this mutates an `Array[Double]`
   * rather than transforming a `Vector[Double]`. Straightforward but inefficient.
   */
  def interpret(e: Expr, m: Array[Double]): Unit = e match {
    case Num(d, n) => m(d) = n
    case Decr(d) => m(d) = m(d) - 1.0
    case Plus(d, i, j) => m(d) = m(i) + m(j)
    case Copy(d, i) => m(d) = m(i)
    case Loop(haltIf0, p) => interpretLoop(haltIf0, p, m)
    case Block(es) => interpretBlock(es, m)
  }

  // Notice that we have interpreter overhead _on each execution of the loop body_.
  def interpretLoop(haltIf0: Int, p: Expr, m: Array[Double]): Unit =
    while (!(m(haltIf0) == 0)) interpret(p, m)

  @annotation.tailrec
  def interpretBlock(es: List[Expr], m: Array[Double]): Unit = es match {
    case Nil => ()
    case Block(es0) :: es => interpretBlock(es0 ++ es, m)
    case e :: es => interpret(e, m); interpretBlock(es, m)
  }

  /**
   * Here's a simple partial evaluatator. We curry the `interpret` function,
   * but do all inspection of the syntax tree _before_ returning our
   * compiled form, an `Array[Double] => Unit`.
   *
   * `partialEval` could be called `compile` - we are producing a compiled
   * form with no interpreter overhead, as in the Futamura projections.
   */
  def partialEval(e: Expr): Array[Double] => Unit = e match {
    case Num(d, n) => m => m(d) = n
    case Decr(d) => m => m(d) = m(d) - 1.0
    // case Plus(d, i, j) if d == j => m => m(d) += m(i)
    case Plus(d, i, j) => m => m(d) = m(i) + m(j)
    case Copy(d, i) => m => m(d) = m(i)
    case Loop(haltIf0, p) =>
      val compiledBody = partialEval(p) // very important, we compile the body once!
      m => while (m(haltIf0) != 0.0) compiledBody(m) // ... and then execute it multiple times
    case Block(es) => partialEvalBlock(es)
  }

  def partialEvalBlock(ps: List[Expr]): Array[Double] => Unit = ps match {
    case List(e) => partialEval(e)
    case p :: ps2 =>
      val cp = partialEval(p)
      val cps = partialEvalBlock(ps2)
      m => { cp(m); cps(m) }
  }

  // Performance of this approach is highly dependent on choice of compiled form.
  // An `Array[Double] => Unit` may require computing array offsets and doing array
  // bounds checks. To improve performance, we can move to a function that just
  // takes a mutable record of `Double` values:

  case class Machine(var r0: Double, var r1: Double, var r2: Double, var r3: Double)

  // Our compiled form will be `Machine => Unit` for this second partial evaluator.
  // Not being able to just use array offsets requires a bit more code than before.

  object Machine {
    def get(i: Int): Machine => Double = i match {
      case 0 => _.r0
      case 1 => _.r1
      case 2 => _.r2
      case 3 => _.r3
    }

    // experimented with this, doesn't seem to make a difference
    //abstract class R { def apply(m: Machine): Double }

    //def get(i: Int): R = i match {
    //  case 0 => new R { def apply(m: Machine) = m.r0 }
    //  case 1 => new R { def apply(m: Machine) = m.r1 }
    //  case 2 => new R { def apply(m: Machine) = m.r2 }
    //  case 3 => new R { def apply(m: Machine) = m.r3 }
    //}
  }

  def partialEval2(e: Expr): Machine => Unit = e match {
    case Num(d, n) => d match {
      case 0 => m => m.r0 = n
      case 1 => m => m.r1 = n
      case 2 => m => m.r2 = n
      case 3 => m => m.r3 = n
    }
    case Decr(d) => d match {
      case 0 => m => m.r0 -= 1.0
      case 1 => m => m.r1 -= 1.0
      case 2 => m => m.r2 -= 1.0
      case 3 => m => m.r3 -= 1.0
    }
    // can make a difference, suggests Machine.get(i) isn't reliably inlined by JIT
    case Plus(1, 0, 1) => m => m.r1 += m.r0
    case Plus(d, i, j) if d == j =>
      val ci = Machine.get(i)
      d match {
        case 0 => m => m.r0 += ci(m)
        case 1 => m => m.r1 += ci(m)
        case 2 => m => m.r2 += ci(m)
        case 3 => m => m.r3 += ci(m)
      }
    case Plus(d, i, j) =>
      val ci = Machine.get(i)
      val cj = Machine.get(j)
      d match {
        case 0 => m => m.r0 = ci(m) + cj(m)
        case 1 => m => m.r1 = ci(m) + cj(m)
        case 2 => m => m.r2 = ci(m) + cj(m)
        case 3 => m => m.r3 = ci(m) + cj(m)
      }
    case Copy(d, i) =>
      val ci = Machine.get(i)
      d match {
        case 0 => m => m.r0 = ci(m)
        case 1 => m => m.r1 = ci(m)
        case 2 => m => m.r2 = ci(m)
        case 3 => m => m.r3 = ci(m)
      }
    // also can make a difference, suggests Machine.get compiled form isn't reliably inlined by JIT
    case Loop(0, p) =>
      val compiledBody = partialEval2(p)
      m => while (m.r0 != 0.0) compiledBody(m)
    case Loop(haltIf0, p) =>
      val cHaltIf0 = Machine.get(haltIf0)
      val compiledBody = partialEval2(p)
      m => while (cHaltIf0(m) != 0.0) compiledBody(m)
    case Block(es) => partialEvalBlock2(es)
  }

  def partialEvalBlock2(ps: List[Expr]): Machine => Unit = ps match {
    case List(e) => partialEval2(e)
    case p :: ps2 =>
      val cp = partialEval2(p)
      val cps = partialEvalBlock2(ps2)
      m => { cp(m); cps(m) }
  }
}

object Ex extends App {
  import Expr._
  import quickprofile.QuickProfile.{suite,profile}

  def N = 1e6 + math.random.floor
  val m = Array(0.0, 0.0, 0.0, 0.0)

  // expects `n` in register 0, puts result in register 1
  val fib = Block(  // var n = <fn param>
    Num(1, 0.0),    // var f1 = 0
    Num(2, 1.0),    // var f2 = 1
    Loop(0, Block(  // while (n != 0) {
      Plus(3, 1, 2),//   val tmp = f1 + f2
      Copy(1, 2),   //   f1 = f2
      Copy(2, 3),   //   f2 = tmp
      Decr(0)))     //   n -= 1
  )                 // }

  @annotation.tailrec
  def fib(n: Double, f0: Double, f1: Double): Double =
    if (n == 0) f0
    else fib(n - 1.0, f1, f0 + f1)

  // Sums up the numbers 0 to `n`.
  // Expects `n` in register 0, puts result in register 1.
  val sumN = Block(
    Num(1, 0.0),
    Loop(0, Block(
      Plus(1, 0, 1),
      Decr(0)
    ))
  )

  @annotation.tailrec
  def sumN(n: Double, acc: Double): Double =
    if (n == 0.0) acc
    else sumN(n - 1.0, acc + n)

  // Sanity check - let's make sure all implementations produce the same results

  println {
    println ("interpreted")
    (0 until 10).map { i =>
      m(0) = i.toDouble
      interpret(fib, m)
      m(1).toLong
    }.mkString(" ")
  }

  println {
    val csum = partialEval(fib)
    println ("partially-evaluated")
    (0 until 10).map { i =>
      m(0) = i.toDouble
      csum(m)
      m(1).toLong
    }.mkString(" ")
  }

  println {
    val m = Machine(0,0,0,0)
    val csum = partialEval2(fib)
    println ("partially-evaluated (2)")
    (0 until 10).map { i =>
      m.r0 = i.toDouble
      csum(m)
      m.r1.toLong
    }.mkString(" ")
  }

  println {
    println ("native")
    (0 until 10).map { i => fib(i.toDouble, 0.0, 1.0).toLong }.mkString(" ")
  }

  // Okay, now run the profiling suite

  suite (
    { val csum = partialEval2(fib)
      val m = Machine(0.0, 0.0, 0.0, 0.0)
      profile("partially-evaluated (M1)", 0.03) {
        m.r0 = N
        csum(m)
        m.r1.toLong
      }
    },

    { val csum = partialEval2(fib)
      val m = Machine(0.0, 0.0, 0.0, 0.0)
      profile("partially-evaluated (M2)", 0.03) {
        m.r0 = N
        csum(m)
        m.r1.toLong
      }
    },

    { val csum = partialEval2(fib)
      val m = Machine(0.0, 0.0, 0.0, 0.0)
      profile("partially-evaluated (M3)", 0.03) {
        m.r0 = N
        csum(m)
        m.r1.toLong
      }
    },

    { val m = Array.fill(4)(0.0)
      profile("interpreted", 0.03) {
        m(0) = N
        interpret(fib, m)
        m(1).toLong
      }
    },

    profile("Scala", 0.03) { fib(N, 0.0, 1.0).toLong },

    { val csum = partialEval(fib)
      val m = Array.fill(4)(0.0)
      profile("partially-evaluated (A1)", 0.03) {
        m(0) = N
        csum(m)
        m(1).toLong
      }
    }
  )
}
