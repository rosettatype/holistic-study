// functions
// shuffle an array in place
function shuffle(a) {
	var j, x, i
	for (i = a.length; i; i -= 1) {
		j = Math.floor(Math.random() * i)
		x = a[i - 1]
		a[i - 1] = a[j]
		a[j] = x
	}
}

// get a list of random, unique indexes
function getIndexes(count, total) {
	var i = 0
	var result = []
	while (i < count) {
		x = Math.floor((Math.random() * total) + 1)
		if (result.indexOf(x) == -1) {
			result.push(x)
			i++
		}
	}
	return result
}


// settings
// - URL

// available letters: aehijlnuv
// available combinations: AA, AB, BA, BB

form_url = "https://getform.io/f/eb496034-9170-4c5f-a86a-703fb9005800"
practice_samples = [
	["a_AA", "a_BB"],
	["j_BB", "j_BB"],
	["h_BB", "h_AA"],
	["n_AB", "n_AB"],
	["i_BA", "i_BA"],
]
main_samples = [
	["a_AA", "a_BB"],
	["j_BB", "j_BB"],
	["h_BB", "h_AA"],
	["n_AA", "n_BA"],
	["e_AA", "e_AB"],
	["u_BA", "u_BB"],
	["e_BA", "e_AA"],
	["n_AA", "n_AA"],
]

var counter = 0
var total_trials = practice_samples.length + main_samples.length

// compile the forms

// set url of the form to submit to
var form = $("form")
form.attr("action", form_url)

// shuffle the samples to mix words and non-words
shuffle(practice_samples)
shuffle(main_samples)

// add a series of trials for the practice
fs = $("#practice")
practice_samples.forEach(function (tuple, index, array) {
	sample1 = tuple[0]
	sample2 = tuple[1]
	trialID =  "practice_" + (index + 1)
	// create fieldset for a word
	fs.after('<fieldset class="trial" id="fs_' + trialID + '"><h2>Practice: do these look alike?</h2></fieldset>')
	fs = $("#fs_" + trialID)
	wordSVGURL1 = "samples/SVGs/" + sample1 + ".svg"
	wordSVGURL2 = "samples/SVGs/" + sample2 + ".svg"
	fs.append('<div class="trialarea">' +
				'<div class="sample"><img src="' +  wordSVGURL1 + '" alt=""><img src="' +  wordSVGURL2 + '" alt=""></div>' +
				'<input type="button" class="next button" value="Sure same">' +
				'<input type="button" class="next button" value="Probably same">' +
				'<input type="button" class="next button" value="Probably different">' +
				'<input type="button" class="next button right" value="Sure different">' +
				'</div>')

	// this record will contain: typeface, sample, response, miliseconds
	fs.append('<input type="hidden" name="' + trialID + '" id="' + trialID + '" value="' + sample1 + ',' + sample2 + '" class="hidden response">')

	// progress bar
	fs.append('<h4>Progress</h4><div class="bar"><div class="progressbar" style="width:' + Math.floor(counter / total_trials * 100) + '%"></div></div>')
	counter += 1
})

// add a series of trials for the main part
fs = $("#main")
main_samples.forEach(function (tuple, index, array) {
	sample1 = tuple[0]
	sample2 = tuple[1]
	trialID =  "main_" + (index + 1)
	// create fieldset for a word
	fs.after('<fieldset class="trial" id="fs_' + trialID + '"><h2>Main: do the top halfs of these look alike?</h2></fieldset>')
	fs = $("#fs_" + trialID)
	wordSVGURL1 = "samples/SVGs/" + sample1 + ".svg"
	wordSVGURL2 = "samples/SVGs/" + sample2 + ".svg"
	fs.append('<div class="trialarea">' +
				'<div class="sample"><img src="' +  wordSVGURL1 + '" alt=""><img src="' +  wordSVGURL2 + '" alt=""></div>' +
				'<input type="button" class="next button" value="Sure same">' +
				'<input type="button" class="next button" value="Probably same">' +
				'<input type="button" class="next button" value="Probably different">' +
				'<input type="button" class="next button right" value="Sure different">' +
				'</div>')

	// this record will contain: typeface, sample, response, miliseconds
	fs.append('<input type="hidden" name="' + trialID + '" id="' + trialID + '" value="' + sample1 + ',' + sample2 + '" class="hidden response">')

	// progress bar
	fs.append('<h4>Progress</h4><div class="bar"><div class="progressbar" style="width:' + Math.floor(counter / total_trials * 100) + '%"></div></div>')
	counter += 1
})

// passing through the fieldsets
var current_fs, next_fs  // fieldsets
var opacity  // fieldset property which we will animate
var animating  // flag to prevent quick multi-click glitches
var previous_time  // last time when participant clicked any button
var current_time
function nextSection() {
	if (animating) return false
	form.validate()
	if(!form.valid()) return false
	animating = true

	current_fs = $(this).parent()
	if (current_fs.attr("class") == "trialarea") {
		current_fs = current_fs.parent()
	}
	next_fs = current_fs.next()
	current_time = Number(new Date().getTime())

	// record a trial response
	if (current_fs.attr("class") == "trial") {
		miliseconds = current_time - previous_time
		response = current_fs.children(".response").val()
		response += ", " + $(this).val() + ", " + miliseconds
		current_fs.children(".response").val(response)
	}
	previous_time = current_time

	if (next_fs.attr("id") == "final") {
		// submit when clicking on a button in the penultimate group
		$("form").submit()
	} else {
		//show the next fieldset
		next_fs.show()
		//hide the current fieldset with style
		current_fs.animate({
			opacity: 0
			}, {
			step: function(now, mx) {
				opacity = 1 - now;
				current_fs.css("position", "absolute");
				next_fs.css("opacity", opacity);
			},
			duration: 300,
			complete: function() {
				current_fs.hide();
				animating = false;
			},
		})
		return false
	}
}

jQuery.validator.setDefaults({
	errorPlacement: function(error, element) {
		element.before(error)
	}
})

jQuery.extend(jQuery.validator.messages, {
	required: "Please select one of the options.",
	remote: "Please fix this field.",
	email: "Please enter a valid email address.",
	url: "Please enter a valid URL.",
	date: "Please enter a valid date.",
	dateISO: "Please enter a valid date (ISO).",
	number: "Please enter a valid number.",
	digits: "Please enter only digits.",
	creditcard: "Please enter a valid credit card number.",
	equalTo: "Please enter the same value again.",
	accept: "Please enter a value with a valid extension.",
	maxlength: jQuery.validator.format("Please enter no more than {0} characters."),
	minlength: jQuery.validator.format("Please enter at least {0} characters."),
	rangelength: jQuery.validator.format("Please enter a value between {0} and {1} characters long."),
	range: jQuery.validator.format("Please enter a value between {0} and {1}."),
	max: jQuery.validator.format("Please enter a value less than or equal to {0}."),
	min: jQuery.validator.format("Please enter a value greater than or equal to {0}.")
})

$(".next").click(nextSection)

// sliders updates
$('input[type="range"]').change(function () {
	$(this).siblings(".slider_value").text("Value: " + $(this).val())
})