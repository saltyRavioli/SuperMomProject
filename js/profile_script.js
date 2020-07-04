$(document).ready(function () {
  $('.nav ul li:first').addClass('active');
  $('.tab-content:not(:first)').hide();
  $('.nav ul li a').click(function (event) {
    event.preventDefault();
    var content = $(this).attr('href');
    $(this).parent().addClass('active');
    $(this).parent().siblings().removeClass('active');
    $(content).show();
    $(content).siblings('.tab-content').hide();
  });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiPGFub255bW91cz4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsS0FBaEIsQ0FBc0IsUUFBQSxDQUFBLENBQUE7SUFDcEIsQ0FBQSxDQUFFLFlBQUYsQ0FBZSxDQUFDLFdBQWhCLENBQTRCLFFBQTVCO1dBQ0EsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLFFBQVIsQ0FBaUIsUUFBakI7RUFGb0IsQ0FBdEI7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIiQoXCJ1bC5tZW51IGxpXCIpLmNsaWNrIC0+XG4gICQoXCJ1bC5tZW51IGxpXCIpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICQodGhpcykuYWRkQ2xhc3MgJ2FjdGl2ZSciXX0=
//# sourceURL=coffeescript